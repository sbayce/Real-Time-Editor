import React from 'react'
import InviteModal from './InviteModal'
import DocumentIcon from "@/app/icons/document-outline.svg"
import OnlineUsersModal from './OnlineUsersModal'
import downloadPdf from '@/utils/editor/download-pdf'
import { createQuill } from '@/utils/editor/create-quill'
import { Socket } from 'socket.io-client'
import Quill from 'quill'
import OnlineUser from '@/app/types/online-user'
import MenuIcon from "@/app/icons/menu-outline.svg"
import { useMediaQuery } from 'react-responsive'
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
  } from "@nextui-org/react"

type UtilityMenuProps = {
    socket: Socket | null,
    quills: Quill[],
    parent: any,
    onlineUsers: OnlineUser[] | null,
    setQuills: any
    editorId: string
}

const UtilityMenu = ({ socket, quills, parent, setQuills, onlineUsers, editorId }: UtilityMenuProps) => {
    const isMdOrLarger = useMediaQuery({minWidth: 840})
        return (
            <div className="flex gap-4 items-center">
                <InviteModal />
                <Button radius="sm" variant="flat" className="pt-0 px-2 text-white bg-black text-sm gap-1 w-full ms:w-auto"
                    onClick={() => createQuill(socket, quills, setQuills, parent)}>
                    <DocumentIcon className="w-4" />
                    Add page
                </Button>
                <Button variant="flat" color="danger" radius="sm" className="text-white bg-black w-full ms:w-auto"
                    onClick={() => downloadPdf(quills, editorId)}>
                    Download PDF
                </Button>
                <OnlineUsersModal onlineUsers={onlineUsers} />
            </div>
          )
    // return (
    //     <Dropdown className="shadow-lg border">
    //             <DropdownTrigger>
    //               <Button variant="flat" className='flex items-center text-white bg-black rounded-md p-0'>
    //                 <MenuIcon className="w-6" />
    //                 Menu
    //               </Button>
    //             </DropdownTrigger>
    //             <DropdownMenu>
    //               <DropdownItem className='p-0 mb-2'>
    //                 <InviteModal />
    //               </DropdownItem>
    //               <DropdownItem className='p-0 mb-2'>
    //                 <Button radius="sm" variant="flat" className="pt-0 px-2 w-full ms:w-auto text-white bg-black"
    //                     onClick={() => createQuill(socket, quills, setQuills, parent)}>
    //                     <DocumentIcon className="w-4" />
    //                     Add page
    //                 </Button>
    //               </DropdownItem>
    //               <DropdownItem className='p-0 mb-2'>
    //                 <Button variant="flat" color="danger" radius="sm" className="w-full ms:w-auto text-white bg-black"
    //                     onClick={() => downloadPdf(quills, editorId)}>
    //                     Download PDF
    //                 </Button>
    //               </DropdownItem>
    //               <DropdownItem className='p-0 mb-2'>
    //                 <OnlineUsersModal onlineUsers={onlineUsers} />
    //               </DropdownItem>
                  
    //             </DropdownMenu>
    //           </Dropdown>
    // )
}

export default UtilityMenu