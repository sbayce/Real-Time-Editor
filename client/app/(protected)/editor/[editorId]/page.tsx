"use client"
import React, { useCallback } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import Editor from "@/app/types/editor"
import SelectionProperties from "@/app/types/SelectionProperties"
import renderLiveCursors from "@/utils/editor/render-live-cursors"
import { useQueryClient } from "react-query"
import { sizeWhitelist, fontWhitelist } from "@/app/lib/editor/white-lists"
import changeCursorPosition from "@/utils/editor/change-cursor-position"
import AccessType from "@/app/types/access-type"
import getEditorContent from "@/utils/editor/get-editor-content"
import renderQuills from "@/utils/editor/render-quills"
import handleKeyDown from "@/utils/editor/key-down-handlers"
import throttleTitleChange from "@/utils/editor/throttle-title-change"
import OnlineUsersList from "@/app/components/editor/OnlineUsersList"
import {useMediaQuery} from 'react-responsive'
import exceedsPageSize from "@/utils/editor/exceeds-page-size"
import { initializeQuill } from "@/utils/editor/create-quill"
import removeQuill from "@/utils/editor/remove-quill"
import textChangeHandler from "@/utils/editor/event-handlers/text-change-handler"
import recieveChangeHandler from "@/utils/editor/event-handlers/recieve-change-handler"
import selectionChangeHandler from "@/utils/editor/event-handlers/selection-change-handler"
import UtilityMenu from "@/app/components/editor/UtilityMenu"
import OnlineUser from "@/app/types/online-user"

const Size: any = Quill.import("attributors/style/size")
const Font: any = Quill.import("formats/font")
Size.whitelist = sizeWhitelist
Font.whitelist = fontWhitelist
Quill.register(Font, true)
Quill.register(Size, true)

const handlePageExit = (e: any, socket: Socket, quills: Quill[], isChanged: boolean) => {
  if(isChanged){
    e.preventDefault()
    e.returnValue = true
    const content = getEditorContent(quills)
    socket.emit("save:editor", content)
  }
}

const page = () => {
  const [editorData, setEditorData] = useState<Editor | null | undefined>(undefined)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null)
  const [quills, setQuills] = useState<Quill[]>([])
  const [parent, setParent] = useState()
  const [title, setTitle] = useState('')
  const [selectionProperties, setSelectionProperties] = useState<SelectionProperties[]>([])
  const [isChanged, setIsChanged] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [areChangesSent, setAreChangesSent] = useState(false)
  const [isMaster, setIsMaster] = useState(false)
  const queryClient = useQueryClient()
  const isMdOrLarger = useMediaQuery({minWidth: 1287})

  const viewEditor = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/view-editor/${editorId}`,
        {
          withCredentials: true,
        }
      )
      const data = res.data
      setEditorData(data)
    } catch (error: any) {
      setEditorData(null)
      console.log(error.message)
    }
  }
  const handleTitleChange = (e: any) => {
    const value = e.target.value
    throttleTitleChange(value, socket)
    setTitle(value)
  }
  
  useEffect(() => {
    viewEditor()
  }, [])

  useEffect(() => {
    if (!editorData || !parent) return

    const socket: Socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
      auth: {
        roomId: editorId,
        userEmail: editorData.userEmail,
        username: editorData.username,
      },
      withCredentials: true,
      transports: ['websocket']
    })
    setSocket(socket)
    socket.on("recieve:master", (content) => {
      console.log("recieved from master: ", content)
      if(content){
        console.log("Loaded from Master")
        renderQuills(content, socket, quills, setQuills, parent)
      }else{
        console.log("Loaded from DB")
        renderQuills(editorData.content, socket, quills, setQuills, parent)
      }
    })
    socket.on("new:master", () => {
      setIsMaster(true)
      console.log("became master")
    })
    socket.emit("request:latest")
    setTitle(editorData.title)
    return () => {
      socket.off("recieve:master")
    }
  }, [editorData, parent])

  useEffect(() => {
    if(!title) return
    document.title = title
  }, [title])

  useEffect(() => {
    if (!socket || !parent) return

    socket.on("online:users", (data) => {
      setOnlineUsers(data)
    })
    socket.on("recieve:page", ({ index }) => {
      console.log("revieved new page")
      const newQuill = initializeQuill(parent, index)
      setQuills((prev: any) => [...prev, newQuill])
    })
    socket.on("recieve:title", (title) => {
      setTitle(title)
    })

    return () => {
      if (socket) {
        console.log("socket disconnecting...")
        socket.disconnect()
      }
    }
  }, [socket, parent])

  // update selection properties
  useEffect(() => {
    if(!onlineUsers || !selectionProperties) return
    selectionProperties.map((selectionPropery, index) => {
      if(!onlineUsers.some((user) => user.socketId === selectionPropery.socketId)){
        setSelectionProperties((prevState: any) => {
          const updatedState = [...prevState]
          updatedState.splice(index, 1)
          return updatedState
        })
        
      }
    })
  }, [onlineUsers])

  useEffect(() => {
    if(!selectionProperties || quills.length === 0) return
    const divs = renderLiveCursors(selectionProperties, onlineUsers, quills)
    return () => {
      divs.forEach(({ cursor, ql, highlight }) => {
        ql.removeChild(cursor)
        ql.removeChild(highlight)
      });
    };

  }, [socket, onlineUsers, selectionProperties, quills])

  const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper === null) return
    wrapper.innerHTML = ""
    setParent(wrapper)
  }, [])

  /* This useEffect updates all the editors (quills) event listeners when new editors are added
     States need to be updated: useEffect holds states of when it was created (state doesn't update)
  */
  useEffect(() => {
    if (!quills || !socket || !parent || !editorData || !onlineUsers) return

    // setup before-unload listener (to alert client that changes might not be saved when exiting)
    const handleBeforeUnload = (e: any) => handlePageExit(e, socket, quills, isChanged);
    window.addEventListener("beforeunload", handleBeforeUnload)
    
    // setup listener for sending content of the master (for newly joined sockets)
    socket.on("master:request", (requestingSocket) => {
      console.log("master request here.")
      const content = getEditorContent(quills)
      socket.emit("send:master:content", {content, requestingSocket})
    })

    // setup delete page listener
    socket.on("page:to:remove", (index) => {
      if (!quills[index - 1]) return
      if(quills[index].hasFocus()){
        quills[index - 1].focus()
      }
      removeQuill(parent, index, socket, quills, setQuills, setSelectionProperties)
    })
    // setup changes reciever listener
    const recieveHandler = recieveChangeHandler(isMaster, setIsChanged, quills, selectionProperties, setSelectionProperties, areChangesSent, socket)
    socket.on("recieve:changes", recieveHandler)

    // setup selection reciever listener
    socket.on("recieve:selection", ({ selectionIndex, selectionLength, index, senderSocket }) => {
      const selectedQuill = quills[index]
      selectionLength > 0 && console.log("recieved selection: ", selectedQuill.getText(selectionIndex, selectionLength))
      changeCursorPosition(selectionIndex, selectionLength, selectedQuill, selectionProperties, senderSocket, index, setSelectionProperties)
    }
    )
    let listeners: ((event: any) => void)[] = []
    quills.map((q, index) => {
      // setup key down listener
      const keyDownHandler = handleKeyDown(quills, setQuills, setSelectionProperties, q, index, exceedsPageSize, socket, parent) //closure
      listeners.push(keyDownHandler)
      q.container.addEventListener("keydown", keyDownHandler)

      // setup text change listener
      const textHandler = textChangeHandler( //closure
        q, index,quills, socket, setQuills, parent, selectionProperties, setSelectionProperties,
        areChangesSent, setAreChangesSent, isMaster, setIsChanged, queryClient, editorId
      )
      q.on("text-change", textHandler)

      // setup selection change listener
      const selectionHandler = selectionChangeHandler(q, index, socket)
      q.on("selection-change", selectionHandler)
    })
    return () => {
      socket.off("recieve:changes")
      socket.off("recieve:selection")
      socket.off("page:to:remove")
      socket.off("master:request")
      quills.map((quill, i) => {
        quill.off("text-change")
        quill.off("selection-change")
        quill.container.removeEventListener("keydown", listeners[i])
      })
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [quills, socket, onlineUsers, selectionProperties, parent, editorData, isChanged, areChangesSent, isMaster])

  console.log(quills)
  console.log("selection Properties: ", selectionProperties)

  console.log("content:", getEditorContent(quills))
  console.log("isMaster:", isMaster)
  const editorId = usePathname().split("/")[2]
  return (
    <>
      {editorData === null && <div className="flex flex-col gap-2 items-center mt-10"><img className="w-20" src="/lock.png" alt="lock-img" /><p className="text-lg m-auto">You do not have access to this document.</p></div>}
      {editorData && (
        <>
        <div className="fixed top-0 right-12 sm:right-20 z-20 pt-3 px-6 flex justify-between items-center gap-4">
        {isSaving && <p>Saving...</p>}
        <UtilityMenu socket={socket} quills={quills} parent={parent} setQuills={setQuills} onlineUsers={onlineUsers} editorId={editorId} />
      </div>
        <div className="py-2">
          <div className="flex justify-between px-6 fixed right-0 gap-4 pt-8 z-20">
              <input
                value={title}
                className="self-start flex justify-between left-2 fixed bg-transparent hover:bg-none text-xl mr-2 mx-8 top-[60px]"
                onChange={handleTitleChange}
              />
                 
          </div>
          <div className="flex gap-10 sm:justify-center justify-start pt-40">
            <div id="wrapperRef" ref={wrapperRef} className="relative"></div>
              {onlineUsers && isMdOrLarger && <OnlineUsersList onlineUsers={onlineUsers} />}
          </div>
        </div>
        </>)}
    </>
  )
}

export default page
