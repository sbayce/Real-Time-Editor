"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Image } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import axios from "axios"

type WorkspaceProps = {
  workspace: any
}

const Workspace = ({ workspace }: WorkspaceProps) => {
  const router = useRouter()
  const [data, setData] = useState(workspace)
  console.log(data)

  const dateFormat = (dateString: string) => {
    const date = new Date(dateString)
    return "Created " + date.toLocaleDateString()
  }
  const createEditor = async() => {
    const res = await axios.post("http://localhost:4000/user/create-editor", {}, {withCredentials: true})
    setData([...data, res.data])
  }
  return (
    <div className="grid grid-cols-4 gap-4">
      <button onClick={createEditor}>Create Editor</button>
      {data && data.map((editor: any) => {
        return (
          <div
            key={editor.id}
            onClick={() => {
              router.push(`/editor/${editor.id}`)
            }}
            className="border rounded-md flex flex-col gap-2 cursor-pointer hover:border-gray-400"
          >
            <Image
              src="./img.jfif"
              radius="none"
              className="rounded-t-md object-cover aspect-video w-[25.5rem] min-h-[13.5rem]"
            />
            <div className="px-2">
              <p className="font-medium">{editor.title}</p>
              <p className="text-sm text-gray-400">
                {dateFormat(editor.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Workspace
