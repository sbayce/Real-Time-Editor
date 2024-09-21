"use client"
import React, { useCallback } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import { Avatar, Button, Chip } from "@nextui-org/react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import InviteModal from "@/app/components/editor/InviteModal"
import OnlineUser from "@/app/types/online-user"
import Editor from "@/app/types/editor"
import getUserColor from "@/utils/editor/get-user-color"
import updateLiveCursor from "@/utils/editor/update-live-cursor"
import SelectionProperties from "@/app/types/SelectionProperties"
import renderLiveCursors from "@/utils/editor/render-live-cursors"
import DocumentIcon from "@/app/icons/document-outline.svg"
import { useQueryClient } from "react-query"
import { Delta } from "quill/core"
import {throttledKeyPress, setIgnoredDelta, cancelThrottle} from "@/utils/editor/throttle-key-press"
// import { createThrottleInstance } from "@/utils/editor/throttle-key-press"
import throttleSelectionChange from "@/utils/editor/throttle-selection-change"
import { sizeWhitelist, fontWhitelist } from "@/app/lib/editor/white-lists"
import debounceScreenShot from "@/utils/editor/debounce-screenshot"
import {toolbarOptions, addTooltips} from "@/app/lib/editor/quil-toolbar"
import changeCursorPosition from "@/utils/editor/change-cursor-position"
import AccessType from "@/app/types/access-type"
import getEditorContent from "@/utils/editor/get-editor-content"
import renderQuills from "@/utils/editor/render-quills"
import isEqual from 'lodash.isequal'
import handleKeyDown from "@/utils/editor/key-down-handlers"
import throttleTitleChange from "@/utils/editor/throttle-title-change"
import calcLinesDiff from "@/utils/delta/calc-lines-diff"

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
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null)
  const [quills, setQuills] = useState<Quill[]>([])
  const [parent, setParent] = useState()
  const [selectionProperties, setSelectionProperties] = useState<SelectionProperties[]>([])
  const [isChanged, setIsChanged] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [areChangesSent, setAreChangesSent] = useState(false)
  const queryClient = useQueryClient()

  const viewEditor = async () => {
    setIsLoading(true)
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
    setIsLoading(false)
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
        renderQuills(content, handleCreateQuill, loadQuill, socket)
      }else{
        console.log("Loaded from DB")
        renderQuills(editorData.content, handleCreateQuill, loadQuill, socket)
      }
    })
    socket.emit("request:latest")
    setTitle(editorData.title)
    return () => {
      socket.off("recieve:master")
    }
  }, [editorData, parent])

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

  const initializeQuill = (container: any, id: string) => {
    // document.getElementById(`quill-${id}`)?.remove()
    const editor = document.createElement("div")
    editor.style.border = "none"
    editor.id = `quill-${id}`
    container.appendChild(editor)
    const quillInstance = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions, history: { userOnly: true } },
    })
    if(editorData?.accessType === AccessType.Read || id !== '0'){
      const toolbar = quillInstance.getModule("toolbar") as { container: HTMLDivElement }
      toolbar.container.style.visibility = "hidden"
    }
    addTooltips(quillInstance)
    return quillInstance
  }

  const removeQuill = (container: any, index: number) => {
    if (!socket || !quills) return
    // const quillElement = document.querySelector(`#quill-${index}`)
    // if(quillElement) container.removeChild(quillElement)
    const quillElement = quills[index].container
    console.log("container", container)
    console.log("quill elem", quillElement)
    if(quillElement){
      container.removeChild(quillElement)
    }
    setQuills((prev: any) => {
      const newQuills = [...prev]
      newQuills.splice(index, 1)
      return newQuills
    })
    /* should remove cursors from target quill (that will be deleted)
       cursors from quills below target quill should shift their index -1
       cursors from quills above target quill should remain the same */

    setSelectionProperties(prev => {
      const newSelectionProperties = prev.filter(selectionProperty => selectionProperty.quillIndex !== index)
      .map(selectionProperty => {
        if(selectionProperty.quillIndex > index){
          return {
            ...selectionProperty,
            quillIndex: selectionProperty.quillIndex-1
          }
        }else{
          return {...selectionProperty}
        }
      })
      // const newSelectionProperties = prev.filter(selectionProperty => selectionProperty.quillIndex !== index)
      console.log("NEW SELECTION PROPERTIES: ", newSelectionProperties)
      return newSelectionProperties
    })
  }

  const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper === null) return
    wrapper.innerHTML = ""
    setParent(wrapper)
  }, [])

  const handleCreateQuill = (socket: Socket | null) => {
    console.log(parent, quills, socket)
    if (parent && quills && socket) {
      const index = quills.length
      console.log("quill length: ", index)
      const newQuill = initializeQuill(parent, String(index))
      // auto-focus
      setTimeout(() => {
        newQuill.focus()
      }, 0)
      setQuills((prev: any) => [...prev, newQuill])
      socket.emit("add:page", { index })
    }
  }

  // periodic save
  useEffect(() => {
    if(!socket || quills.length === 0) return
    const interval = setInterval(() => {
      if(isChanged){
        setIsSaving(true)
        const content = getEditorContent(quills)
        socket.emit("save:editor", content)
        setIsChanged(false)
        setTimeout(() => {
          setIsSaving(false)
        }, 2000)
      }
    }, 2000)
    return () => {
      clearInterval(interval)
    }
  }, [socket, quills, isChanged])

  /* This useEffect updates all the editors (quills) event listeners when new editors are added
     States need to be updated: useEffect holds states of when it was created (state doesn't update)
  */
  useEffect(() => {
    if (!quills || !socket || !parent || !editorData || !onlineUsers) return

    // const throttleInstances: any[] = []
    // quills.forEach(() => {
    //   throttleInstances.push(createThrottleInstance())
    // })

    const handleBeforeUnload = (e: any) => handlePageExit(e, socket, quills, isChanged);

    window.addEventListener("beforeunload", handleBeforeUnload)
    
    socket.on("master:request", (requestingSocket) => {
      console.log("master request here.")
      const content = getEditorContent(quills)
      socket.emit("send:master:content", {content, requestingSocket})
    })

    socket.on("page:to:remove", (index) => {
      if (!quills[index - 1]) return
      if(quills[index].hasFocus()){
        quills[index - 1].focus()
      }
      removeQuill(parent, index)
    })

    socket.on("recieve:changes", ({ delta, index, oldDelta } :{ delta: Delta, index: number, oldDelta: Delta}) => {
      console.log("got delta: ", delta.ops, "from index: ", index)
      const selectedQuill = quills[index]
      // create plain objects and remove prototypes (to check for equality of objects' structure)
      const senderContent = JSON.parse(JSON.stringify(oldDelta))
      const currentContent = JSON.parse(JSON.stringify(selectedQuill?.getContents()))

      if(isEqual(senderContent, currentContent)){
        console.log("without conflicts")
        selectedQuill.updateContents(delta)

        updateLiveCursor(delta, selectionProperties, setSelectionProperties, selectedQuill, index)

      }else{ 
        // should handle conflicts
        console.log("sender old: ", senderContent)
        console.log("current cont: ", currentContent)
        const difference = new Delta(oldDelta).diff(selectedQuill?.getContents())
        console.log("DIFF: ", difference)
        const diff = calcLinesDiff(oldDelta, selectedQuill?.getContents())
        console.log(diff)

        let actualTransform: any
        let transformed: any
        if(areChangesSent){
          transformed = difference?.transform(delta, true)
          actualTransform = diff?.transform(delta, true)
        }else{
          transformed = difference?.transform(delta, false)
          actualTransform = diff?.transform(delta, false)
        }
        console.log("transformed: ", transformed)
        console.log("actual transform: ", actualTransform);
        // const invertedDelta = actualTransform.invert(selectedQuill.getContents())
        // setIgnoredDelta(invertedDelta)
        // selectedQuill.updateContents(actualTransform)

        // updateLiveCursor(actualTransform, selectionProperties, setSelectionProperties, selectedQuill, index)
        const invertedDelta = transformed.invert(selectedQuill.getContents())
        setIgnoredDelta(invertedDelta)
        selectedQuill.updateContents(transformed)

        updateLiveCursor(transformed, selectionProperties, setSelectionProperties, selectedQuill, index)
      }  
    })

    socket.on("recieve:selection", ({ selectionIndex, selectionLength, index, senderSocket }) => {
      const selectedQuill = quills[index]
      selectionLength > 0 && console.log("recieved selection: ", selectedQuill.getText(selectionIndex, selectionLength))
      changeCursorPosition(selectionIndex, selectionLength, selectedQuill, selectionProperties, senderSocket, index, setSelectionProperties)
    }
    )
    let listeners: ((event: any) => void)[] = []
    if(editorData.accessType === AccessType.Write){
      quills.map((q, index) => {
        q.off("text-change")
        q.off("selection-change")
        const keyDownHandler = handleKeyDown(quills, q, index, exceedsPageSize, removeQuill, cancelThrottle, socket, parent) //closure
        listeners.push(keyDownHandler)
        q.container.addEventListener("keydown", keyDownHandler)
        q.on("text-change", (delta: Delta, oldDelta: Delta, source) => {
          if (source !== "user") return
          console.log(q.getContents())
          // check if new content increased page size beyond threshold
          if(exceedsPageSize(q, index)){
            //should cancel the changes and add a new page
            let isDelete = false
            delta.ops.forEach(op => {
              if(op.delete){
                isDelete = true
              }
            })
            if(!isDelete){
              q.updateContents(delta.invert(oldDelta), 'silent')
              if (quills[index + 1]) { //switch to page below if it exists
                setTimeout(() => {
                  q.blur()
                  quills[index + 1].focus()
                }, 0.1)
              } else {
                handleCreateQuill(socket)
              }
            }
          }else{
            throttledKeyPress(delta, q, index, socket, oldDelta, setAreChangesSent)
            if (index === 0) {
              debounceScreenShot(queryClient, editorId)
            }
            if(areChangesSent){
              setAreChangesSent(false)
            }
            setIsChanged(true)
          }

          updateLiveCursor(delta, selectionProperties, setSelectionProperties, q, index, true)
        })
        q.on("selection-change", (range, oldRange, source) => {
          if ( !range) return
          const toolbars = document.querySelectorAll(".ql-toolbar.ql-snow")
          toolbars.forEach(toolbar => {
            (toolbar as HTMLElement ).style.visibility = "hidden"
          })
          const toolbar = q.getModule("toolbar") as { container: HTMLDivElement }
          toolbar.container.style.visibility = "visible"

          const selectionLength = range.length
          const selectionIndex = range.index
          throttleSelectionChange(selectionIndex, selectionLength, index, socket)
        })
      })
    }
    return () => {
      socket.off("recieve:changes")
      socket.off("recieve:selection")
      socket.off("page:to:remove")
      socket.off("master:request")
      socket.off("DB:update")
      quills.map((quill, i) => {
        quill.off("text-change")
        quill.off("selection-change")
        quill.container.removeEventListener("keydown", listeners[i])
      })
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [quills, socket, onlineUsers, selectionProperties, parent, editorData, isChanged, areChangesSent])

  const loadQuill = (id: string, content: any) => {
    if (parent && quills) {
      const newQuill = initializeQuill(parent, id)
      setQuills((prev: any) => [...prev, newQuill])
      newQuill.setContents(content)
      if(editorData?.accessType === AccessType.Write){
        newQuill.enable()
      }else{
        newQuill.disable()
      }
    }
  }
  console.log(quills)
  console.log("selection Properties: ", selectionProperties)

  const exceedsPageSize = (quill: Quill, quillIndex: number) => {
    if (!quill || !quills || !socket) return

    let pageSize = quill.root.clientHeight
    let sum = 0
    for (let i = 0; i < quill.root.children.length; i++) {
      sum += quill?.root.children[i].clientHeight
    }
    if (sum > pageSize - 50) {
      return true
    }
    return false
  }
  console.log("content:", getEditorContent(quills))
  const editorId = usePathname().split("/")[2]
  return (
    <div>
      {isLoading && <p className="text-center text-lg">Loading...</p>}
      {editorData === null && <div className="flex flex-col gap-2 items-center mt-10"><img className="w-20" src="/lock.png" alt="lock-img" /><p className="text-lg m-auto">You do not have access to this document.</p></div>}
      {editorData && (
        <>
        <div className="fixed top-0 right-20 z-20 pt-4 px-6 flex justify-between items-center gap-4">
        {isSaving && <p>Saving...</p>}
        <div className="flex gap-4 items-center">
          <InviteModal />
          <Button
            radius="sm"
            variant="flat"
            className="pt-0 px-2 text-white bg-black text-sm gap-1"
            onClick={() => handleCreateQuill(socket)}
          >
            <DocumentIcon className="w-4" />
            Add page
          </Button>
          <Button
          variant="flat"
          color="danger"
          radius="sm"
          className="text-white bg-black"
            onClick={async () => {
              const delta = getEditorContent(quills);
              console.log("all content:", delta);
              const response = await fetch(`/editor/${editorId}/pdf`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ delta }),
              });
              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'editor-content.pdf');
                document.body.appendChild(link);
                link.click();
              } else {
                console.error('Failed to generate PDF');
              }
            }}
          >
            Download PDF
          </Button>
        </div>
      </div>
        <div className="py-2">
          <div className="flex justify-between px-6 fixed right-0 gap-4 pt-8 z-20">
              <input
                value={title}
                className="self-start flex justify-between left-2 fixed bg-transparent hover:bg-none text-xl mr-2 mx-8 top-12"
                onChange={handleTitleChange}
              />
                 
          </div>
          <div className="flex gap-10 justify-center pt-40">
            <div id="wrapperRef" ref={wrapperRef} className="relative"></div>
            <div className="flex flex-col gap-2 w-56 absolute right-16">
              <h1>Online Collaborators</h1>
              {onlineUsers &&
                onlineUsers.map((user: OnlineUser) => {
                  return (
                    <Chip key={user.socketId} variant="light">
                      <div className="flex items-center gap-1">
                        <Avatar
                          size="sm"
                          style={{ borderColor: user.color }}
                          className="border-2 w-6 h-6"
                          name={user.username}
                          getInitials={(name) => name.charAt(0)}
                        />
                        {user.username}
                      </div>
                    </Chip>
                  )
                })}
            </div>
          </div>
        </div>
        </>)}
    </div>
  )
}

export default page
