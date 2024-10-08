import React from 'react'
import InviteModal from './InviteModal'
import DocumentIcon from "@/app/icons/document-outline.svg"
import { Button } from '@nextui-org/react'
import OnlineUsersModal from './OnlineUsersModal'
import downloadPdf from '@/utils/editor/download-pdf'
import { createQuill } from '@/utils/editor/create-quill'
import { useContext } from 'react'
import { EditorContext } from '@/app/contexts/editor-context'

const UtilityMenu = ({ editorId }: { editorId: string }) => {
    const { socket, quills, setQuills, parent, onlineUsers } = useContext(EditorContext)
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