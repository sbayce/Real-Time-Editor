'use client'
import Quill from "quill"
import { createContext, useState } from "react"
import { Socket } from "socket.io-client"
import OnlineUser from "../types/online-user"

type EditorContextType = {
  onlineUsers: OnlineUser[] | null
  socket: Socket | null
  quills: Quill[]
  parent: any
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>
  setQuills: React.Dispatch<React.SetStateAction<Quill[]>>
  setParent: React.Dispatch<React.SetStateAction<any>>
  setOnlineUsers: React.Dispatch<React.SetStateAction<OnlineUser[] | null>>
}

export const EditorContext = createContext<EditorContextType>({
  onlineUsers: null,
  socket: null,
  quills: [],
  parent: null,
  setSocket: () => {},
  setQuills: () => {},
  setParent: () => {},
  setOnlineUsers: () => {},
})

export default function EditorContextProvider({
    children,
  }: Readonly<{
    children: React.ReactNode
  }>) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[] | null>(null)
    const [quills, setQuills] = useState<Quill[]>([])
    const [parent, setParent] = useState()
  
    return (
        <EditorContext.Provider
          value={{
            onlineUsers,
            socket,
            quills,
            parent,
            setSocket,
            setParent,
            setOnlineUsers,
            setQuills,
          }}
        >
          {children}
        </EditorContext.Provider>
    )
  }
