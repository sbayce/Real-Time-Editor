"use client"
import React from "react"
import { useState } from "react"
import AddIcon from "@/app/icons/add-outline.svg"
import axios from "axios"
import { useQueryClient } from "react-query"
import GridView from "./GridView"
import { Toaster, toast } from "sonner"

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
        toast.success("Document created.")
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
        toast.success("Document deleted.")
      })
  }
  console.log(collaboratedData)
  return (
    <>
          <Toaster />
          <h1 className="text-2xl font-medium mb-4 text-center">
            Your Work
          </h1>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 place-items-center">
            <button
              onClick={createEditor}
              className="flex justify-center items-center border rounded-sm w-[208px] h-[379px] hover:border-gray-400"
            >
              <AddIcon className="w-14" />
            </button>
            {ownedData && (<>
              {ownedData.length === 0 && <h1 className="text-xl w-[300px]">Create documents.</h1>}
              {
                <GridView
                  data={ownedData}
                  deleteEditor={deleteEditor}
                  queryClient={queryClient}
                />
              }
            </>
          )}
          </div>
      {collaboratedData.length > 0 && (
        <>
          <h1 className="text-2xl font-medium mb-4 text-center mt-8">
            Your Collaboration
          </h1>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 place-items-center">
              <GridView
                data={collaboratedData}
                queryClient={queryClient}
              />
          </div>
        </>
      )}
    </>
  )
}

export default Workspace
