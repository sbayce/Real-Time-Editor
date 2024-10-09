import React from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Chip,
  Avatar,
} from "@nextui-org/react"
import PeopleIcon from "@/app/icons/people-outline.svg"
import OnlineUser from "@/app/types/online-user"

const OnlineUsersModal = ({onlineUsers}: {onlineUsers: OnlineUser[] | null}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  return (
    <>
      <Button
        onPress={onOpen}
        radius="sm"
        variant="flat"
        color="primary"
        className="p-2 gap-1 w-full ms:w-auto"
      >
        <PeopleIcon className="w-4" />
        Collaborators
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        className="rounded-md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 font-normal text-xl">
                Online Collaborators
              </ModalHeader>
              <ModalBody>
                {onlineUsers?.map(user => {
                    return (
                        <Chip key={user.socketId} variant="light">
                          <div className="flex items-center gap-1 w-56">
                            <Avatar
                              size="sm"
                              style={{ borderColor: user.color }}
                              className="border-2 w-6 h-6 p-2"
                              name={user.username}
                              getInitials={(name) => name.charAt(0)}
                            />
                            <div>
                              <p className="truncate w-full">{user.username}</p>
                              <p className="truncate w-full">{user.email}</p>                          
                            </div>
                          </div>
                        </Chip>
                      )
                })}
              </ModalBody>
              <ModalFooter>
                <Button className="bg-black text-white rounded-md" variant="flat" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
export default OnlineUsersModal
