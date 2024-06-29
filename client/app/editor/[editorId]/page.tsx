"use client"
import React, { useCallback } from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import { Chip } from "@nextui-org/react"
import Quill from "quill"
import "quill/dist/quill.snow.css"
import toolbarOptions from "@/app/lib/editor/quil-toolbar"

type Editor = {
  id: string
  title: string
  content: any
  created_at: string
  updated_at: string
  userEmail: string
}

const page = () => {
  const [editorData, setEditorData] = useState<Editor | null>(null)
  const [title, setTitle] = useState(editorData?.title)
  const [isEditableTitle, setIsEditableTitle] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [quill, setQuill] = useState<Quill | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      },
    })
    setSocket(socket)
    setTitle(editorData?.title)
    quill.setContents(JSON.parse(editorData.content))
    quill.enable()
  }, [editorData, quill])

  useEffect(() => {
    if (!socket || !quill) return

    socket.on("recieve-changes", (delta) => {
      quill.updateContents(delta)
    })

    socket.on("recieve_title", (title) => {
      setTitle(title)
    })

    quill.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return
      const content = quill.getContents()
      socket.emit("send-changes", { delta: delta, content: content })
    })

    return () => {
      quill.off("text-change")
    }
  }, [socket, quill])

  useEffect(() => {
    if (!socket) return

    socket?.on("online_users", (data) => {
      console.log("online users are: " + data)
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

  const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper === null) return
    wrapper.innerHTML = ""
    const editor = document.createElement("div")
    wrapper.append(editor)
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    })
    setQuill(q)
  }, [])
  const ql = document.querySelector(".ql-editor")
  let prevSelection: any
  let prevText: any
  ql?.addEventListener("mouseup", () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      // console.log(selection)
      const range = selection.getRangeAt(0)
      if (range && !range.collapsed) {
        prevText = range.toString()
        prevSelection = selection
        const span = document.createElement("span")
        span.style.backgroundColor = "rgba(128, 0, 128, 0.5)"
        span.textContent = range.toString()

        range.deleteContents()
        range.insertNode(span)
        prevSelection = range
        // console.log(range)
        // Deselect text after highlighting
        // selection.removeAllRanges()
      }
    }
  })
  ql?.addEventListener("mousedown", () => {
    const selection = window.getSelection()
    // console.log(selection)
    if (prevSelection && prevText) {
      console.log(prevSelection.commonAncestorContainer.innerHTML)
      console.log(prevSelection.commonAncestorContainer.innerText)
      prevSelection.commonAncestorContainer.innerHTML =
        prevSelection.commonAncestorContainer.innerText
      // console.log("prev text: " + prevText)
      // prevSelection.deleteContents()
      // prevSelection.insertNode(prevText)
    }
  })
  const editorId = usePathname().split("/")[2]
  return (
    <div>
      {editorData ? (
        <>
          <div className="flex justify-between">
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
            <div className="flex flex-col gap-2">
              {onlineUsers &&
                onlineUsers.map((email: string) => {
                  return (
                    <div className="flex items-center gap-2">
                      <Chip variant="dot" color="success">
                        {email}
                      </Chip>
                    </div>
                  )
                })}
            </div>
          </div>
          <div className="flex flex-col gap-4 items-center justify-center p-4">
            <div ref={wrapperRef}></div>
          </div>
        </>
      ) : (
        <p>Cannot view</p>
      )}
    </div>
  )
}

export default page
