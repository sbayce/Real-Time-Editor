"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import updateContent from "@/app/lib/editor/update-content"
import { Chip } from "@nextui-org/react"
// import socket from "@/app/lib/socket"

// var socket: Socket = io("http://localhost:4000")

type Editor = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  userEmail: string
}

const page = () => {
  const [editorData, setEditorData] = useState<Editor | null>(null)
  const [text, setText] = useState("")
  const [title, setTitle] = useState(editorData?.title)
  const [isEditableTitle, setIsEditableTitle] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState([])

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
      setText(data.content)
    } catch (error: any) {
      console.log(error.message)
    }
  }
  const handleContentChange = async (event: any) => {
    try {
      const textValue = event.target.value
      setText(textValue)
      updateContent(textValue, editorId)
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    viewEditor()
  }, [])

  useEffect(() => {
    if (!editorData) {
      return
    }
    if (editorData) {
      const socket: Socket = io("http://localhost:4000", {
        auth: {
          roomId: editorId,
          userEmail: editorData.userEmail,
        },
      })
      setSocket(socket)
      setTitle(editorData?.title)
    }
  }, [editorData])

  useEffect(() => {
    socket?.on("recieve_message", (data) => {
      console.log("recieved message from controller: " + data)
      setText(data)
    })

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
  console.log(onlineUsers)
  const editorId = usePathname().split("/")[2]
  return (
    <div>
      {editorData ? (
        <>
          <div className="flex justify-between">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setIsEditableTitle(false)
              }}
              className="self-start flex justify-between"
            >
              <input
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
            <textarea
              className="border rounded-lg p-2 w-full"
              placeholder="Enter text"
              onChange={handleContentChange}
              value={text}
            />
          </div>
        </>
      ) : (
        <p>Cannot view</p>
      )}
    </div>
  )
}

export default page
