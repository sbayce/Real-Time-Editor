"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Image } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import axios from "axios"

type WorkspaceProps = {
  owned: any
  collaborated: any
}

const Workspace = ({ owned, collaborated }: WorkspaceProps) => {
  const router = useRouter()
  const [ownedData, setOwnedData] = useState<null | any>(owned)
  const [collaboratedData, setCollaboratedData] = useState<null | any>(collaborated)
  console.log(ownedData)

  const dateFormat = (dateString: string) => {
    const date = new Date(dateString)
    return "Created " + date.toLocaleDateString()
  }
  const createEditor = async() => {
    await axios.post("http://localhost:4000/user/create-editor", {}, {withCredentials: true}).then((res) => {
      console.log(res.data)
      setOwnedData([...ownedData, res.data])
    })
  }
  return (
    <>
    {ownedData && <div>
      <h1 className="text-lg font-medium mb-2">Your Editors</h1>
      <div className="grid grid-cols-5 gap-4">
      <button onClick={createEditor}>Create Editor</button>
      {ownedData && ownedData.map((editor: any) => {
        return (
          <div
            key={editor.id}
            onClick={() => {
              router.push(`/editor/${editor.id}`)
            }}
            className="border rounded-md flex flex-col gap-2 cursor-pointer hover:border-gray-400 w-[208px]"
          >
            <Image
              src="./img.jfif"
              radius="none"
              className="rounded-t-md object-cover aspect-video w-[25.5rem] min-h-[19.5rem]"
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
      </div>}
      {collaboratedData && <div>
      <h1>Your Collaboration</h1>
      <div className="grid grid-cols-4 gap-4">
      <button onClick={createEditor}>Create Editor</button>
      {collaboratedData && collaboratedData.map((editor: any) => {
        return (
          <div
            key={editor.id}
            onClick={() => {
              router.push(`/editor/${editor.id}`)
            }}
            className="border rounded-md flex flex-col gap-2 cursor-pointer hover:border-gray-400 w-[208px]"
          >
            <Image
              src="./img.jfif"
              radius="none"
              className="rounded-t-md object-cover aspect-video w-[25.5rem] min-h-[19.5rem]"
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
      </div>}
    </>
  )
}

export default Workspace
