import React from "react";
import { useState } from "react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link} from "@nextui-org/react";
import { Toaster, toast } from 'sonner'
import axios, { AxiosError } from "axios";
import { usePathname } from "next/navigation";

const InviteModal = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [email, setEmail] = useState("")
  const editorId = usePathname().split("/")[2]

  const handleInvite = async() => {
    try{
        if(!email){
            toast.error("Please enter an email.")
            return
        }
        await axios.post(`http://localhost:4000/user/invite-collaborator/${editorId}`, {
            email: email
        }, {withCredentials: true}).then(() => {
            toast.success("User has been invited.")
        })
    }catch(error: any){
        toast.error(error.response.data)
    }
  }
  return (
    <>
    <Toaster position="top-center" />
      <Button onPress={onOpen} variant="bordered" color="primary">Invite</Button>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="top-center"
        className="rounded-md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Invite a collaborator</ModalHeader>
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
                <Button color="danger" variant="flat" onPress={onClose}>
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
  );
}
export default InviteModal