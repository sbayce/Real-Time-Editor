"use client"
import React, { useCallback } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import { Avatar, Chip } from "@nextui-org/react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import toolbarOptions from "@/app/lib/editor/quil-toolbar"
import InviteModal from "@/app/components/editor/InviteModal"

type Editor = {
  id: string
  title: string
  content: any
  created_at: string
  updated_at: string
  userEmail: string
  username: string
}

type OnlineUser = {
  socketId: string,
  email: string,
  username: string,
  color: string
}

const page = () => {
  const [editorData, setEditorData] = useState<Editor | null>(null)
  const [title, setTitle] = useState(editorData?.title)
  const [isEditableTitle, setIsEditableTitle] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null)
  const [quill, setQuill] = useState<Quill | null>(null)
  const [quills, setQuills] = useState<Quill[] | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pages, setPages] = useState(1)
  const [parent, setParent] = useState()
  
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

  const handleMouseUp = () => {
    const selection = window.getSelection()
    if(!quill || !socket || !onlineUsers || !selection || (selection.rangeCount === 0)) return
    const range = selection.getRangeAt(0)
    if(range.collapsed) return
    const user = onlineUsers.find((user: OnlineUser) => user.socketId === socket.id)
    if(!user) return
    const userColor = user.color
    const text = range.toString()
    console.log(text)
    console.log(selection)
    const span = document.createElement("span")
    span.id = String(socket.id)
    span.style.backgroundColor = userColor
    span.textContent = text
    range.deleteContents()
    range.insertNode(span)
  }

  const handleMouseDown = () => {
    try{
      const ql = document.querySelector(".ql-editor")
      if (!quill || !socket || !onlineUsers) return
        const textToBeUnselected = ql?.querySelector(`#${socket.id}`)
        console.log(textToBeUnselected)
        if(textToBeUnselected){
          console.log("alo")
          let pa = textToBeUnselected?.parentNode
          while(textToBeUnselected?.firstChild) pa?.insertBefore(textToBeUnselected.firstChild, textToBeUnselected)
        }
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() => {
    const ql = document.querySelector(".ql-editor")

    if(ql){
      ql.addEventListener("mouseup", handleMouseUp)
      ql.addEventListener("mousedown", handleMouseDown)

      return () => {
        ql.removeEventListener("mouseup", handleMouseUp)
        ql.removeEventListener("mousedown", handleMouseDown)
      }
    }

  }, [quill, socket, onlineUsers])

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

    return quillInstance

  }, []);

    const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper === null) return
    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    editor.style.border = "none"
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    })
    setParent(wrapper)
    setQuill(q)
    setQuills([q])
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
    socket.on("recieve-changes", ({delta, index}) => {
      console.log("delta: " , delta.ops)
      console.log("index: ", index)
      const selectedQuill = quills[index]
      selectedQuill.updateContents(delta)
    })
    quills.map((q, index) => {
      q.off("text-change")

      q.on("text-change", (delta, oldDelta, source) => {
        if (source !== "user") return
        const content = q.getContents()
        socket.emit("send-changes", { delta, content, index })
      })
    })
  }, [quills, socket])

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

  // const ql = document.querySelector(".ql-editor")
  // console.log(ql)
  // ql?.addEventListener("mouseup", (e) => {
  //   if(!quill) return
  // const selection = quill?.getSelection()
  // if(!selection) return
  // console.log("selection: ", selection?.index)
  // const index = selection.index
  // const length = selection.length
  // quill?.deleteText(index,length)
  // quill.insertText(index, "h")
  //   const selection = window.getSelection()
  //   if (selection && selection.rangeCount > 0) {
  //     // find user color from socket
  //     const user = onlineUsers.find((user: OnlineUser) => user.socketId === socket?.id)
  //     console.log(user)
  //     const userColor = user?.color
  //     console.log("color: ", userColor)
  //     const range = selection.getRangeAt(0)
  //     if (range && !range.collapsed && userColor && socket) {
  //       prevText = range.toString()
  //       prevSelection = selection
  //       const span = document.createElement("span")
  //       span.id = String(socket.id)
  //       span.style.backgroundColor = userColor
  //       span.textContent = range.toString()

        // range.deleteContents()
        // range.insertNode(span)
  //       prevSelection = range
  //       prevInnerHTML = prevSelection.commonAncestorContainer.innerHTML
  //       prevInnerText = prevSelection.commonAncestorContainer.innerText

  //       // Reselect the new range
  //       selection.removeAllRanges();
  //       const newRange = document.createRange();
  //       newRange.selectNode(span);
  //       selection.addRange(newRange);
  //       // console.log(range)
  //       // Deselect text after highlighting
  //       // selection.removeAllRanges()
  //     }
  //   }
  // })
  // ql?.addEventListener("mousedown", () => {
  //   try{
  //     if (ql && socket) {
  //       const textToBeUnselected = ql?.querySelector(`#${socket?.id}`)
  //       if(textToBeUnselected){
  //         console.log("alo")
  //         let pa = textToBeUnselected?.parentNode
  //         while(textToBeUnselected?.firstChild) pa?.insertBefore(textToBeUnselected.firstChild, textToBeUnselected)
  //       }
        
  //       // console.log(prevSelection.commonAncestorContainer.innerHTML)
  //       // console.log(prevSelection.commonAncestorContainer.innerText)
  //       // console.log(prevInnerHTML)
  //       // console.log(prevInnerText)
  //       // prevSelection.commonAncestorContainer.innerHTML =
  //       //   prevSelection.commonAncestorContainer.innerText
  //       // prevInnerHTML = prevInnerText
  //       // console.log("prev text: " + prevText)
  //       // prevSelection.deleteContents()
  //       // prevSelection.insertNode(prevText)
  //     }
  //   }catch(e){
  //     console.log(e)
  //   }
    
  // })
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
            <div ref={wrapperRef} className=""></div>
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
