import React from "react"
import { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react"
import { toast } from "sonner"
import axios from "axios"
import { usePathname } from "next/navigation"
import type { UseDisclosureReturn } from '@nextui-org/use-disclosure';

const InviteModal = ({disclosure}: {disclosure: UseDisclosureReturn}) => {
  const { isOpen, onOpen, onClose, onOpenChange } = disclosure
  const [email, setEmail] = useState("")
  const editorId = usePathname().split("/")[2]

  const handleInvite = async () => {
    try {
      if (!email) {
        toast.error("Please enter an email.")
        return
      }
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/invite-collaborator/${editorId}`,
          {
            email: email,
          },
          { withCredentials: true }
        )
        .then(() => {
          toast.success("User has been invited.")
        })
    } catch (error: any) {
      toast.error(error.response.data)
    }
  }
  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="top-center"
        className="rounded-md"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Invite a collaborator
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Email"
                  placeholder="Enter user's email"
                  variant="bordered"
                  value={email}
                  onValueChange={setEmail}
                  required
                />
              </ModalBody>
              <ModalFooter>
                <Button className="bg-black text-white rounded-md" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onClick={handleInvite} type="submit">
                  Invite
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
export default InviteModal
