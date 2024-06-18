"use client"
import React from "react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import axios from "axios"

var socket: Socket = io("http://localhost:4000")

const page = () => {
  const [editorData, setEditorData] = useState<any>(null)
  const [text, setText] = useState("")
  const joinRoom = () => {
    socket.emit("join_room", editorId)
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
      joinRoom()
    } catch (error: any) {
      console.log(error.message)
    }
  }
  const handleChange = async (event: any) => {
    try {
      const textValue = event.target.value
      setText(textValue)
      await axios
        .post(
          `http://localhost:4000/editor/update-editor/${editorId}`,
          {
            content: textValue,
          },
          { withCredentials: true }
        )
        .catch((error) => {
          throw new Error(error)
        })
    } catch (err) {
      console.log(err)
    }
  }
  useEffect(() => {
    viewEditor()
  }, [])
  useEffect(() => {
    socket?.on("recieve_message", (data) => {
      console.log("recieved message from controller: " + data)
      setText(data)
    })

    return () => {
      console.log("socket closing.")
      socket.off()
    }
  }, [socket])
  const editorId = usePathname().split("/")[2]
  return (
    <div>
      {editorData ? (
        <div className="flex flex-col gap-4 items-center justify-center p-4">
          <h1>{editorData.title}</h1>
          <textarea
            className="border rounded-lg p-2 w-full"
            placeholder="Enter text"
            onChange={handleChange}
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
