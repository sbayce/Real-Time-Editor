"use client"
import React from "react"
import { useState, useEffect } from "react"
import AddIcon from "@/app/icons/add-outline.svg"
import axios from "axios"
import { useQueryClient } from "react-query"
import GridView from "./GridView"

type WorkspaceProps = {
  owned: any
  collaborated: any
}

const Workspace = ({ owned, collaborated }: WorkspaceProps) => {
  const [ownedData, setOwnedData] = useState<null | any>(owned)
  const [collaboratedData, setCollaboratedData] = useState<null | any>(
    collaborated
  )
  const queryClient = useQueryClient()
  console.log(ownedData)

  const createEditor = async () => {
    await axios
      .post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/create-editor`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        console.log(res.data)
        setOwnedData([...ownedData, res.data])
        queryClient.invalidateQueries("get-workSpace")
      })
  }
  const deleteEditor = async (editorId: number) => {
    await axios
      .delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/delete-editor/${editorId}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data)
        const filteredOwnedData = ownedData.filter(
          (editor: any) => editor.id !== editorId
        )
        setOwnedData(filteredOwnedData)
        queryClient.invalidateQueries("get-workSpace")
      })
  }
  return (
    <>
      {ownedData && (
        <div>
          <h1 className="text-3xl font-medium mb-4 text-center">
            Your Work
          </h1>
          <div className="grid grid-cols-5 gap-4">
            <button
              onClick={createEditor}
              className="flex justify-center items-center border rounded-sm w-[208px] h-[23.5rem] hover:border-gray-300"
            >
              <AddIcon className="w-14" />
            </button>
            {ownedData && (
              <GridView
                data={ownedData}
                deleteEditor={deleteEditor}
                queryClient={queryClient}
              />
            )}
          </div>
        </div>
      )}
      {collaboratedData.length > 0 && (
        <div>
          <h1 className="text-3xl font-medium mb-4 text-center mt-8">
            Your Collaboration
          </h1>
          <div className="grid grid-cols-4 gap-4">
              <GridView
                data={collaboratedData}
                deleteEditor={deleteEditor}
                queryClient={queryClient}
              />
          </div>
        </div>
      )}
    </>
  )
}

export default Workspace
