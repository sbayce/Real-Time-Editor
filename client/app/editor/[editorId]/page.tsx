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
import throttledKeyPress from "@/utils/editor/throttle-key-press"
import { sizeWhitelist, fontWhitelist } from "@/app/lib/editor/white-lists"
import debounceScreenShot from "@/utils/editor/debounce-screenshot"
import toolbarOptions from "@/app/lib/editor/quil-toolbar"
import changeCursorPosition from "@/utils/editor/change-cursor-position"
import AccessType from "@/app/types/access-type"
import getEditorContent from "@/utils/editor/get-editor-content"
import renderQuills from "@/utils/editor/render-quills"

const Size: any = Quill.import("attributors/style/size")
const Font: any = Quill.import("formats/font")
Size.whitelist = sizeWhitelist
Font.whitelist = fontWhitelist
Quill.register(Font, true)
Quill.register(Size, true)

const handlePageExit = (e: any, socket: Socket, quills: Quill[]) => {
  e.preventDefault()
  e.returnValue = true
  const content = getEditorContent(quills)
  socket.emit("save-editor", content)
}

const page = () => {
  const [editorData, setEditorData] = useState<Editor | null>(null)
  const [title, setTitle] = useState(editorData?.title)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null)
  const [quills, setQuills] = useState<Quill[]>([])
  const [wrapperElements, setWrapperElements] = useState<HTMLDivElement[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [parent, setParent] = useState()
  const [selectionProperties, setSelectionProperties] = useState<SelectionProperties[] | null>(null)
  const queryClient = useQueryClient()
  console.log("data: ", editorData)

  console.log(onlineUsers)
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
      console.log(error.message)
    }
  }

  const onTitleSubmit = (event: any) => {
    if (!socket) return
    event.preventDefault()
    socket.emit("send_title", title)
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
    })
    setSocket(socket)
    socket.on("recieve-master", (content) => {
      console.log("recieved from master: ", content)
      if(content){
        console.log("Loaded from Master")
        renderQuills(content, handleCreateQuill, loadQuill, socket)
      }else{
        console.log("Loaded from DB")
        renderQuills(editorData.content, handleCreateQuill, loadQuill, socket)
      }
    })
    socket.emit("request-latest")
    setTitle(editorData.title)
    console.log(editorData)
    return () => {
      socket.off("recieve-master")
    }
  }, [editorData, parent])

  // useEffect(() => {
  //   if (!socket || !parent || !editorData) return
  //   if(Object.entries(editorData.content).length === 0){
  //     handleCreateQuill()
  //   }
  //   for (const [key, value] of Object.entries(editorData.content)) {
  //     loadQuill(key, value)
  //   }
  // }, [socket, parent, editorData])

  useEffect(() => {
    if (!socket) return

    socket.on("online_users", (data) => {
      console.log("online users are: ", data)
      setOnlineUsers(data)
    })
    socket.on("recieve-page", ({ index }) => {
      console.log("revieved new page")
      const newQuill = initializeQuill(parent, index)
      setQuills((prev: any) => [...prev, newQuill])
    })
    socket.on("recieve_title", (title) => {
      setTitle(title)
    })

    return () => {
      if (socket) {
        console.log("socket disconnecting...")
        socket.disconnect()
      }
    }
  }, [socket])

  console.log(socket)

  useEffect(() => {
    if(!selectionProperties || wrapperElements.length === 0) return
    console.log("wrapperElements: ", wrapperElements)
    const divs = renderLiveCursors(selectionProperties, onlineUsers, wrapperElements)
    return () => {
      divs.forEach(({ div, ql }) => {
        ql.removeChild(div);
      });
    };

  }, [socket, onlineUsers, selectionProperties, wrapperElements])

  console.log("socket: ", socket)

  const initializeQuill = useCallback((container: any, id: string) => {
    document.getElementById(`quill-${id}`)?.remove()
    const editor = document.createElement("div")
    editor.style.border = "none"
    editor.id = `quill-${id}`
    container.appendChild(editor)
    const quillInstance = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions, history: { userOnly: true } },
    })
    setWrapperElements((prev) => [...prev, editor])
    if(editorData?.accessType === AccessType.Read || id !== '0'){
      const toolbar = quillInstance.getModule("toolbar").container
      toolbar.style.visibility = "hidden"
    }

    return quillInstance
  }, [editorData])

  const removeQuill = (container: any, index: number) => {
    if (!socket || !quills) return
    const quillElement = document.querySelector(`#quill-${index}`)
    container.removeChild(quillElement)
    setQuills((prev: any) => prev.splice(index, 1))
  }

  const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper === null) return
    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    setParent(wrapper)
  }, [])

  const handleCreateQuill = (socket?: Socket) => {
    console.log("in HCQ: ", parent, quills, socket)
    if (parent && quills && socket) {
      const index = quills.length
      console.log("quill length: ", index)
      const newQuill = initializeQuill(parent, String(index))
      setQuills((prev: any) => [...prev, newQuill])
      socket.emit("add-page", { index })
    }
  }

  useEffect(() => {
    if(!socket || quills.length === 0) return
    const interval = setInterval(() => {
      const content = getEditorContent(quills)
      socket.emit("save-editor", content)
    }, 60000)
    return () => {
      clearInterval(interval)
    }
  }, [socket, quills])

  /* This useEffect updates all the editors (quills) event listeners when new editors are added
     States need to be updated: useEffect holds states of when it was created (state doesn't update)
  */
  useEffect(() => {
    if (!quills || !socket || !parent || !editorData || !onlineUsers) return

    const handleBeforeUnload = (e: any) => handlePageExit(e, socket, quills);

    window.addEventListener("beforeunload", handleBeforeUnload)
    
    socket.on("master-request", (requestingSocket) => {
      console.log("master request here.")
      const content = getEditorContent(quills)
      socket.emit("send-master-content", {content, requestingSocket})
    })

    socket.on("page-to-remove", (index) => {
      if (!quills[index - 1]) return
      console.log("will remove page.")
      console.log(quills[index])
      quills[index].blur()
      removeQuill(parent, index)
      quills[index - 1].focus()
    })

    socket.on("recieve-changes", ({ delta, index }) => {
      console.log("delta: ", delta.ops)
      console.log("index: ", index)
      const selectedQuill = quills[index]
      selectedQuill.updateContents(delta)

      updateLiveCursor(delta, selectionProperties, setSelectionProperties, selectedQuill, index)
    })

    socket.on("recieve-selection", ({ selectionIndex, selectionLength, index, senderSocket }) => {
      const selectedQuill = quills[index]
      console.log(
        "recieved selection: ",
        selectedQuill.getText(selectionIndex, selectionLength)
      )
      const userColor = getUserColor(onlineUsers, senderSocket)
      changeCursorPosition(selectionIndex, selectionLength, selectedQuill, selectionProperties, senderSocket, index, setSelectionProperties)
      selectedQuill.formatText(selectionIndex, selectionLength, {background: userColor}, "silent")
    }
    )
    socket.on("replace-selection", ({ selectionIndex, selectionLength, oldRange, index, senderSocket }) => {
        const selectedQuill = quills[index]
        const userColor = getUserColor(onlineUsers, senderSocket)
        console.log("replace this: ",selectedQuill.getText(oldRange)," with this: ", selectedQuill.getText(selectionIndex, selectionLength))
        // preserve other formats and only remove 'background'
        const oldRangeFormat = selectedQuill.getFormat(oldRange.index, oldRange.length)
        delete oldRangeFormat.background
        selectedQuill.removeFormat(oldRange.index, oldRange.length, "silent")
        selectedQuill.formatLine(oldRange.index, oldRange.length, oldRangeFormat, "silent") //preserve line formatting
        selectedQuill.formatText(oldRange.index, oldRange.length, oldRangeFormat, "silent") //preserve text formatting
        // highlight the new selection
        selectedQuill.formatText(selectionIndex, selectionLength, {background: userColor}, "silent")
        changeCursorPosition(selectionIndex, selectionLength, selectedQuill, selectionProperties, senderSocket, index, setSelectionProperties)
      }
    )
    socket.on("recieve-cursor", ({selectionIndex, selectionLength, index, senderSocket}) => {
      const selectedQuill = quills[index]
      console.log("quill index: ", selectedQuill)
      changeCursorPosition(selectionIndex, selectionLength, selectedQuill, selectionProperties, senderSocket, index, setSelectionProperties)
    })
    socket.on("remove-selection", ({ selectionIndex, selectionLength, oldRange, index, senderSocket }) => {
      const selectedQuill = quills[index]
      console.log("remove: ", selectedQuill.getText(oldRange))
      // preserve other formats and only remove 'background'
      const currentFormat = selectedQuill.getFormat(oldRange.index, oldRange.length)
      delete currentFormat.background
      selectedQuill.removeFormat(oldRange.index, oldRange.length, "silent")
      selectedQuill.formatLine(oldRange.index, oldRange.length, currentFormat, "silent") //preserve line formatting
      selectedQuill.formatText(oldRange.index, oldRange.length, currentFormat, "silent") //preserve text formatting
      changeCursorPosition(selectionIndex, selectionLength, selectedQuill, selectionProperties, senderSocket, index, setSelectionProperties)
    })
    if(editorData.accessType === AccessType.Write){
      quills.map((q, index) => {
        q.off("text-change")
        q.off("selection-change")

        q.on("text-change", (delta: Delta, oldDelta, source) => {
          if (source !== "user") return
          throttledKeyPress(delta, q, index, socket)
          if (index === 0) {
            debounceScreenShot(queryClient, editorId)
          }
          // check if new content increased page size beyond threshold
          const shouldRevertChanges = checkPageSize(q, index)
          if(shouldRevertChanges){
            //should cancel the changes and add a new page
            q.updateContents(delta.invert(oldDelta))
            if (quills[index + 1]) { //switch to page below if it exists
              setTimeout(() => {
                q.blur()
                quills[index + 1].focus()
              }, 0.1)
            } else {
              handleCreateQuill()
            }
          }

          updateLiveCursor(delta, selectionProperties, setSelectionProperties, q, index)
        })
        q.on("selection-change", (range, oldRange, source) => {
          if (source !== "user" || (!range && !oldRange)) return
          if (range) {
            console.log("range: ", range)
            const toolbars = document.querySelectorAll(".ql-toolbar.ql-snow")
            for (let i = 0; i < toolbars.length; i++) {
              toolbars[i].style.visibility = "hidden"
            }
            const toolbar: HTMLDivElement = q.getModule("toolbar").container
            toolbar.style.visibility = "visible"
          }
          if (!range && oldRange && oldRange.length !== 0) {
            // console.log("remove selection by focus: ", {oldRange})
            socket.emit("remove-selection", { oldRange, index })
          } else if (range) {
            const selectionLength = range.length
            const selectionIndex = range.index
            if (selectionLength > 0 && (!oldRange || oldRange.length === 0)) {
              console.log("selection: ")
              socket.emit("selection-change", {
                selectionIndex,
                selectionLength,
                index,
              })
            } else if (selectionLength > 0 && oldRange && oldRange.length > 0) {
              socket.emit("replace-selection", {
                selectionIndex,
                selectionLength,
                oldRange,
                index,
              })
            } else if (selectionLength === 0 && oldRange && oldRange.length > 0) {
              socket.emit("remove-selection", { selectionIndex, selectionLength, oldRange, index })
            } else if (
              selectionLength === 0 &&
              oldRange &&
              oldRange.length === 0
            ) {
              socket.emit("cursor-update", {selectionIndex, selectionLength, index})
            }
          }
        })
      })
    }
    return () => {
      socket.off("recieve-changes")
      socket.off("recieve-selection")
      socket.off("replace-selection")
      socket.off("remove-selection")
      socket.off("recieve-cursor")
      socket.off("page-to-remove")
      socket.off("master-request")
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [quills, socket, onlineUsers, selectionProperties, parent, editorData])

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
  // console.log("selection Properties: ", selectionProperties)

  const checkPageSize = (quill: Quill, quillIndex: number) => {
    if (!quill || !quills || !socket) return
    // removes page when the content is empty. Auto focuses to the previous page
    if (quill.getLength() === 1 && quills[quillIndex - 1]) {
      setTimeout(() => {
        quill.blur()
        removeQuill(parent, quillIndex)
        socket.emit("remove-page", quillIndex)
        quills[quillIndex - 1].focus()
      }, 0.1)
    }
    let pageSize = quill.root.clientHeight
    let sum = 0
    for (let i = 0; i < quill.root.children.length; i++) {
      sum += quill?.root.children[i].clientHeight
    }
    console.log("height: ", pageSize)
    console.log("sum: ", sum)
    console.log("quill length: ", quill.getLength())
    if (sum > pageSize - 50) {
      return true
    }
    return false
  }

  const editorId = usePathname().split("/")[2]
  return (
    <div>
      {editorData ? (
        <div className="py-2">
          <div className="flex justify-between px-6 fixed right-0 gap-4 pt-8 z-20">
            <form
              onSubmit={onTitleSubmit}
              className="self-start flex justify-between left-2 fixed"
            >
              <input
                ref={inputRef}
                value={title}
                className="bg-transparent hover:bg-none text-xl mr-2"
                onChange={(e) => {
                  setTitle(e.target.value)
                }}
              />
            </form>
            <InviteModal />
            <Button
              radius="sm"
              variant="ghost"
              color="primary"
              onClick={handleCreateQuill}
            >
              <DocumentIcon className="w-4" />
              Add page
            </Button>
          </div>
          <div className="flex gap-10 justify-center pt-40">
            <div ref={wrapperRef} className="relative"></div>
            <div className="flex flex-col gap-2 w-56 absolute right-16">
              <h1>Online Collaborators</h1>
              {onlineUsers &&
                onlineUsers.map((user: any) => {
                  return (
                    <Chip variant="light">
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
      ) : (
        <p>Cannot view</p>
      )}
    </div>
  )
}

export default page
