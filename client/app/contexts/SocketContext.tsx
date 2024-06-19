import React, { Children, useState, useEffect } from "react"
import { createContext } from "react"
import { io, Socket } from "socket.io-client"

const SocketContext = createContext({})

const SocketContextProvider = ({ Children }: any) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  useEffect(() => {
    const socketConnection = io("http://localhost:4000", {
      withCredentials: true,
    })
    setSocket(socketConnection)
    return () => {
      socket?.close()
    }
  }, [])
  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {Children}
    </SocketContext.Provider>
  )
}

export { SocketContext, SocketContextProvider }
