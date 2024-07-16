"use client"
import React, { useCallback } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import { Avatar, Chip } from "@nextui-org/react"
import Quill, { Bounds } from "quill"
import "quill/dist/quill.snow.css"
import toolbarOptions from "@/app/lib/editor/quil-toolbar"
import InviteModal from "@/app/components/editor/InviteModal"
import OnlineUser from "@/app/types/online-user"
import Editor from "@/app/types/editor"
import getUserColor from "@/utils/editor/get-user-color"
import updateLiveCursor from "@/utils/editor/update-live-cursor"
import SelectionProperties from "@/app/types/SelectionProperties"
import renderLiveCursors from "@/utils/editor/render-live-cursors"

const page = () => {
  const [editorData, setEditorData] = useState<Editor | null>(null)
  const [title, setTitle] = useState(editorData?.title)
  const [isEditableTitle, setIsEditableTitle] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null)
  const [quill, setQuill] = useState<Quill | null>(null)
  const [quills, setQuills] = useState<Quill[] | null>(null)
  const [wrapperElements, setWrapperElements] = useState<HTMLDivElement []>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const [pages, setPages] = useState(1)
  const [parent, setParent] = useState()
  const [selectionProperties, setSelectionProperties] = useState<SelectionProperties[] | null>(null)
  
console.log(onlineUsers)
  const viewEditor = async () => {
    try {
      const res = await axios.get(
        `http://localhost:4000/user/view-editor/${editorId}`,
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
    setIsEditableTitle(false)
  }
  useEffect(() => {
    viewEditor()
  }, [])

  useEffect(() => {
    if (!editorData || !quill) {
      return
    }
    const socket: Socket = io("http://localhost:4000", {
      auth: {
        roomId: editorId,
        userEmail: editorData.userEmail,
        username: editorData.username
      },
    })
    setSocket(socket)
    setTitle(editorData?.title)
    console.log(editorData)
    quill.setContents(editorData.content[0])
    quill.enable()

  }, [editorData, quill])

  useEffect(() => {
    if (!socket || !quill) return

    socket.on("recieve_title", (title) => {
      setTitle(title)
    })

    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return
      const content = quill.getContents()
      socket.emit("send-changes", { delta: delta, content: content, index: 0 })
    })

    return () => {
      quill.off("text-change")
    }
  }, [socket, quill])

  useEffect(() => {
    if(!socket || !quills || !parent || !editorData) return

    if(Object.entries(editorData.content).length > 1){
      for(const [key, value] of Object.entries(editorData.content)){
        if(key === "0") continue
        loadQuill(value)
      }
    }

    socket.on("recieve-page", ({index}) => {
      console.log("revieved new page")
      const newQuill = initializeQuill(parent);
      setQuills((prev: any) => [...prev, newQuill]);
      newQuill.on("text-change", (delta, oldDelta, source) => {
        if (source !== "user") return
        const content = quills[index].getContents()
        socket.emit("send-changes", { delta: delta, content: content, index })
      })
    })

  }, [socket, parent, editorData])

  useEffect(() => {
    if (!socket) return

    socket.on("online_users", (data) => {
      console.log("online users are: " , data)
      setOnlineUsers(data)
    })

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [socket])

  useEffect(() => {
    if (isEditableTitle && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditableTitle])
  console.log(socket)

  // useEffect(() => {
  //   if(!selectionProperties || wrapperElements.length === 0) return
  //   console.log("wrapperElements: ", wrapperElements)
  //   const divs = renderLiveCursors(selectionProperties, onlineUsers, wrapperElements)
  //   return () => {
  //     divs.forEach(({ div, ql }) => {
  //       ql.removeChild(div);
  //     });
  //   };

  // }, [quill, socket, onlineUsers, selectionProperties, wrapperElements])

  console.log("socket: ", socket)

  const initializeQuill = useCallback((container: any) => {
    const editor = document.createElement('div');
    editor.style.border = 'none';
    editor.className = 'page';
    container.appendChild(editor);

    const quillInstance = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: toolbarOptions },
    });
    // setWrapperElements((prev) => [...prev, editor])

    return quillInstance

  }, []);

    const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper === null) return
    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    editor.style.border = "none"
    editor.id = "0"
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    })
    setParent(wrapper)
    setQuill(q)
    setQuills([q])
    // setWrapperElements([editor])
  }, [])

  const handleCreateQuill = () => {
    if (parent && quills && socket) {
      const newQuill = initializeQuill(parent);
      setQuills((prev: any) => [...prev, newQuill]);
      const index = quills.length
      socket.emit("add-page", ({index}))
      newQuill.on("text-change", (delta, oldDelta, source) => {
        if (source !== "user") return
        const content = newQuill.getContents()
        socket.emit("send-changes", { delta: delta, content: content, index })
      })
    }
  };
  
  /* This useEffect updates all the editors (quills) event listeners when new editors are added
     States need to be updated: useEffect holds states of when it was created (state doesn't update)
  */
  useEffect(() => {
    if(!quills || !socket) return
    socket.off("recieve-changes")
    socket.off("recieve-selection")
    socket.off("replace-selection")
    socket.off("remove-selection")
    socket.off("recieve-cursor")

    socket.on("recieve-changes", ({delta, index}) => {
      console.log("delta: " , delta.ops)
      console.log("index: ", index)
      const selectedQuill = quills[index]
      selectedQuill.updateContents(delta)

      // updateLiveCursor(delta, selectionProperties, setSelectionProperties, selectedQuill, index)
    })

    socket.on("recieve-selection", ({selectionIndex, selectionLength, index, senderSocket}) => {
      const selectedQuill = quills[index]
      console.log("recieved selection: ", selectedQuill.getText(selectionIndex, selectionLength))
      const user = onlineUsers?.find((user: OnlineUser) => user.socketId === senderSocket)
      if(!user) return
      const userColor = user.color
      console.log(onlineUsers)
      // const selectionBounds = selectedQuill.getBounds(selectionIndex, selectionLength)
      // setSelectionProperties((prev) => {
      //   if(prev){
      //     return [...prev, {index: selectionIndex, length: selectionLength, bounds: selectionBounds, quillIndex: index, socketId: senderSocket}]
      //   }else{
      //     return [{index: selectionIndex, length: selectionLength, bounds: selectionBounds, quillIndex: index, socketId: senderSocket}]
      //   }
      // })
      // console.log(selectionBounds)
      selectedQuill.formatText(selectionIndex, selectionLength, {
        'background': userColor
      }, "silent")
    })
    socket.on("replace-selection", ({selectionIndex, selectionLength, oldRange, index, senderSocket}) => {
      const selectedQuill = quills[index]
      const user = onlineUsers?.find((user: OnlineUser) => user.socketId === senderSocket)
      if(!user) return
      const userColor = user.color
      console.log("replace this: ", selectedQuill.getText(oldRange), " with this: ", selectedQuill.getText(selectionIndex, selectionLength))
      // preserve other formats and only remove 'background'
      const oldRangeFormat = selectedQuill.getFormat(oldRange.index, oldRange.length)
      delete oldRangeFormat.background
      selectedQuill.removeFormat(oldRange.index, oldRange.length, "silent")
      selectedQuill.formatLine(oldRange.index, oldRange.length, oldRangeFormat, "silent") //preserve line formatting
      selectedQuill.formatText(oldRange.index, oldRange.length, oldRangeFormat, "silent") //preserve text formatting
      // highlight the new selection
      selectedQuill.formatText(selectionIndex, selectionLength, {
        'background': userColor
      }, "silent")
    })
    // socket.on("recieve-cursor", ({selectionIndex, selectionLength, index, senderSocket}) => {
    //   const selectedQuill = quills[index]
    //   console.log("quill index: ", selectedQuill)
    //   const selectionBounds = selectedQuill.getBounds(selectionIndex, selectionLength)
    //   if(selectionProperties){
    //     const updatedState = selectionProperties.map((selectionProperty: SelectionProperties) => {
    //       if(selectionProperty.socketId === senderSocket){
    //         return {index: selectionIndex, length: selectionLength, bounds: selectionBounds, quillIndex: index, socketId: senderSocket}
    //       }else{
    //         return selectionProperty
    //       }
    //     })
    //     setSelectionProperties(updatedState)
    //   }else{
    //     setSelectionProperties([{index: selectionIndex, length: selectionLength, bounds: selectionBounds, quillIndex: index, socketId: senderSocket}])
    //   }
    // })
    socket.on("remove-selection", ({oldRange, index}) => {
      const selectedQuill = quills[index]
      console.log("remove: ", selectedQuill.getText(oldRange))
      // preserve other formats and only remove 'background'
      const currentFormat = selectedQuill.getFormat(oldRange.index, oldRange.length)
      delete currentFormat.background
      selectedQuill.removeFormat(oldRange.index, oldRange.length, "silent")
      selectedQuill.formatLine(oldRange.index, oldRange.length, currentFormat, "silent") //preserve line formatting
      selectedQuill.formatText(oldRange.index, oldRange.length, currentFormat, "silent") //preserve text formatting
    })
    quills.map((q, index) => {
      q.off("text-change")
      q.off("selection-change")

      q.on("text-change", (delta: any, oldDelta, source) => {
        if (source !== "user") return
        const content = q.getContents()
        socket.emit("send-changes", { delta, content, index })
        // updateLiveCursor(delta, selectionProperties, setSelectionProperties, q, index)
      })
      q.on("selection-change", (range, oldRange, source) => {
        if (source !== "user" || (!range && !oldRange)) return
        if(!range && oldRange && oldRange.length !== 0){
          // console.log("remove selection by focus: ", {oldRange})
          socket.emit("remove-selection", {oldRange, index})
        }else{
          const selectionLength = range.length
          const selectionIndex = range.index
          if(selectionLength > 0 && (!oldRange || oldRange.length === 0) ){
            console.log("selection: " )
            socket.emit("selection-change", {selectionIndex, selectionLength, index})
          }else if(selectionLength > 0 && oldRange && oldRange.length > 0) {
            socket.emit("replace-selection", {selectionIndex, selectionLength, oldRange, index})
            // console.log("new selection: ", {index, length})
            // console.log("replace old: ", {oldRange})
          }else if(selectionLength === 0 && oldRange && oldRange.length > 0){
            // console.log("remove selection: ", {oldRange})
            socket.emit("remove-selection", {oldRange, index})
          }else if(selectionLength === 0 && oldRange && oldRange.length === 0){
            // socket.emit("cursor-update", {selectionIndex, selectionLength, index})
          }
        }
      })
    })

  }, [quills, socket, onlineUsers, selectionProperties])

  const loadQuill = (content: any) => {
    if (parent && quills && socket) {
      console.log("loading page............................................... ", quills.length)
      const newQuill = initializeQuill(parent);
      setQuills((prev: any) => [...prev, newQuill]);
      newQuill.setContents(content)
      newQuill.enable()
    }
  }
  console.log(quills)
  // console.log("selection Properties: ", selectionProperties)

  const editorId = usePathname().split("/")[2]
  return (
    <div>
      {editorData ? (
        <div className="py-2">
          <div className="flex justify-between px-6">
            <form
              onSubmit={onTitleSubmit}
              className="self-start flex justify-between"
            >
              <input
                ref={inputRef}
                value={title}
                disabled={!isEditableTitle}
                className="bg-transparent border-none hover:bg-none text-xl"
                onChange={(e) => {
                  setTitle(e.target.value)
                }}
              />
              <button
                type="button"
                className="hover:bg-gray-400 hover:rounded-lg"
                onClick={() => {
                  setIsEditableTitle(!isEditableTitle)
                }}
              >
                edit
              </button>
            </form>
            <InviteModal />
            <button onClick={handleCreateQuill}>add page</button>
          </div>
          <div className="flex gap-10 justify-center pt-4">
            <div ref={wrapperRef} className="relative"></div>
            <div className="flex flex-col gap-2 w-56">
              <h1>Online Collaborators</h1>
              {onlineUsers &&
                onlineUsers.map((user: any) => {
                  return (
                    // <div className="flex gap-2 items-center text-sm">
                    // <Avatar size="sm" name={user.username} style={{borderColor: user.color}} className={`border-2`} />
                    //   <div className="flex flex-col">
                    //     <p>{user.username}</p>
                    //     <p className=" text-gray-500">{user.email}</p>
                    //   </div>
                    // </div>
                      <Chip variant="light">
                        <div className="flex items-center gap-1">
                          {/* <div className="rounded-full w-2 p-2" style={{backgroundColor: user.color}}></div> */}
                          <Avatar
                          size="sm"
                          style={{borderColor: user.color}} 
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
