"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Image } from "@nextui-org/react"
import { useRouter } from "next/navigation"
import AddIcon from "@/app/icons/add-outline.svg"
import ThreeDotIcon from "@/app/icons/ellipsis-vertical.svg"
import axios from "axios"
import { User, Avatar, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, cn } from "@nextui-org/react"

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
      <h1 className="text-2xl font-medium mb-2 text-center">Your Editors</h1>
      <div className="grid grid-cols-5 gap-4 pt-4">
      <button onClick={createEditor} className="flex justify-center items-center border rounded-sm w-[208px]"><AddIcon className="w-14" /></button>
      {ownedData && ownedData.map((editor: any) => {
        return (
          <div
            key={editor.id}
            onClick={() => {
              router.push(`/editor/${editor.id}`)
            }}
            className="rounded-md flex flex-col cursor-pointer w-[208px]"
          >
            <Image
              src="./img.jfif"
              radius="none"
              className="rounded-t-md object-cover aspect-video w-[25.5rem] min-h-[19.5rem]"
            />
            <div className="flex justify-between px-2 pt-4 border">
              <div className="">
                <p className="font-medium">{editor.title}</p>
                <p className="text-sm text-gray-400">
                  {dateFormat(editor.created_at)}
                </p>
              </div>
              <Dropdown>
                <DropdownTrigger className="hover:bg-gray-400 hover:rounded-full p-0.5">
                  <ThreeDotIcon className="w-6 h-6 self-center opacity-70" />
                </DropdownTrigger>
                <DropdownMenu className="bg-red-500">
                    <DropdownItem>
                      <div >
                        <p>Rename</p>
                        <p>Delete</p>
                      </div>
                    </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        )
      })}
    </div>
      </div>}
      {collaboratedData && <div>
      <h1 className="text-2xl font-medium mb-2 text-center mt-8">Your Collaboration</h1>
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
