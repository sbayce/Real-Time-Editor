"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"
import updateContent from "@/app/lib/editor/update-content"
// import socket from "@/app/lib/socket"

// var socket: Socket = io("http://localhost:4000")

type Editor = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  userId: string
}

const page = () => {
  const [editorData, setEditorData] = useState<Editor | null>(null)
  const [text, setText] = useState("")
  const [title, setTitle] = useState(editorData?.title)
  const [isEditableTitle, setIsEditableTitle] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const joinRoom = () => {
    console.log("socket is: " + socket)
    socket?.emit("join_room", editorId, editorData?.userId)
  }
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
    console.log("editor data is: " + editorData)
    if (editorData && !socket) {
      console.log("editor data is rdy, new socker=t.")
      const socket: Socket = io("http://localhost:4000")
      setSocket(socket)
      setTitle(editorData?.title)
    }
    if (editorData && socket) {
      joinRoom()
    }
  }, [editorData, socket])

  useEffect(() => {
    socket?.on("recieve_message", (data) => {
      console.log("recieved message from controller: " + data)
      setText(data)
    })

    // return () => {
    //   console.log("socket closing.")
    //   socket?.off()
    // }
  }, [socket])
  const editorId = usePathname().split("/")[2]
  return (
    <div>
      {editorData ? (
        <div className="flex flex-col gap-4 items-center justify-center p-4">
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
          <textarea
            className="border rounded-lg p-2 w-full"
            placeholder="Enter text"
            onChange={handleContentChange}
            value={text}
          />
        </div>
      ) : (
        <p>Cannot view</p>
      )}
    </div>
  )
}

export default page
