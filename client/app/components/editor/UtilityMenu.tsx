import React from 'react'
import InviteModal from './InviteModal'
import DocumentIcon from "@/app/icons/document-outline.svg"
import { Button } from '@nextui-org/react'
import OnlineUsersModal from './OnlineUsersModal'
import downloadPdf from '@/utils/editor/download-pdf'
import { createQuill } from '@/utils/editor/create-quill'
import { Socket } from 'socket.io-client'
import Quill from 'quill'
import OnlineUser from '@/app/types/online-user'

type UtilityMenuProps = {
    socket: Socket | null,
    quills: Quill[],
    parent: any,
    onlineUsers: OnlineUser[] | null,
    setQuills: any
    editorId: string
}

const UtilityMenu = ({ socket, quills, parent, setQuills, onlineUsers, editorId }: UtilityMenuProps) => {
    // const { socket, quills, setQuills, parent, onlineUsers } = useContext(EditorContext)
    return (
        <div className="flex gap-4 items-center">
            <InviteModal />
            <Button radius="sm" variant="flat" className="pt-0 px-2 text-white bg-black text-sm gap-1"
                onClick={() => createQuill(socket, quills, setQuills, parent)}>
                <DocumentIcon className="w-4" />
                Add page
            </Button>
            <Button variant="flat" color="danger" radius="sm" className="text-white bg-black"
                onClick={() => downloadPdf(quills, editorId)}>
                Download PDF
            </Button>
            <OnlineUsersModal onlineUsers={onlineUsers} />
        </div>
      )
}

export default UtilityMenu