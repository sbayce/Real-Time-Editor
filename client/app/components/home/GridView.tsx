import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Image } from "@nextui-org/react"
import formatDate from "@/utils/workspace/format-date"
import {
  User,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  cn,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react"
import ThreeDotIcon from "@/app/icons/ellipsis-vertical.svg"
import { Toaster, toast } from "sonner"
import axios from "axios"
import { QueryClient } from "react-query"

type GridViewProps = {
  data: any
  deleteEditor: Function
  queryClient: QueryClient
}

const GridView = ({ data, deleteEditor, queryClient }: GridViewProps) => {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
  const [selectedEditorId, setSelectedEditorId] = useState("")

  const handleRename = async (editorId: string) => {
    try {
      if (!title) {
        toast.error("Enter a title.")
        return
      }
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/editor/update-title/${editorId}`,
          {
            title: title,
          },
          { withCredentials: true }
        )
        .then(() => {
          setTitle("")
          toast.success("Title changed.")
          queryClient.invalidateQueries("get-workSpace")
          let editor = data.find((editor: any) => editor.id === editorId)
          editor.title = title
          onClose()
        })
    } catch (error: any) {
      toast.error(error.response.data)
    }
  }
  return (
    <>
      {data.map((editor: any) => {
        return (
          <div
            key={editor.id}
            onClick={() => {
              router.push(`/editor/${editor.id}`)
            }}
            className="rounded-sm flex flex-col cursor-pointer w-[208px] border hover:border-gray-400"
          >
            <Image
              src={editor.snap_shot ? editor.snap_shot : "./img.jfif"}
              radius="none"
              className="rounded-t-md object-cover aspect-video w-[25.5rem] min-h-[19.5rem] "
            />
            <div className="flex justify-between px-2 pt-4 border-t items-center">
              <div className="">
                <p className="font-medium line-clamp-1 w-40">{editor.title}</p>
                <p className="text-sm text-gray-400">
                  Opened {formatDate(editor.updated_at)}
                </p>
              </div>
              <Dropdown>
                <DropdownTrigger className="hover:bg-gray-400 hover:rounded-full p-0.5">
                  <button>
                    <ThreeDotIcon className="w-5 h-5 self-center opacity-70" />
                  </button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem>
                    <p
                      onClick={() => {
                        setSelectedEditorId(editor.id)
                        onOpen()
                      }}
                    >
                      Rename
                    </p>
                  </DropdownItem>
                  <DropdownItem onClick={() => deleteEditor(editor.id)}>
                    <p>Delete</p>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        )
      })}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        className="rounded-md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Rename</ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Title"
                  placeholder="Enter new title"
                  variant="bordered"
                  value={title}
                  onValueChange={setTitle}
                  required
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => {
                    setTitle("")
                    onClose()
                  }}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onClick={() => handleRename(selectedEditorId)}
                >
                  Rename
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Toaster />
    </>
  )
}

export default GridView
