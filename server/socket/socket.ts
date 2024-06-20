import http from "http"
import { Server } from "socket.io"
import express from "express"
import pool from "../db"

type User = {
  userId: string
}
type Socket = {
  socketId: string
}

type RoomMap = {
  [roomId: string]: [socketId: string]
}

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const roomMap = new Map<string, Map<string, string>>()
const socketMap = new Map<string, string>()

io.on("connection", (socket) => {
  // console.log("auth: " + JSON.stringify(socket.handshake.auth.userId))
  // const userId = socket.handshake.auth.userId
  console.log("new socket: " + socket.id)
  var roomNum: string
  const socketId = socket.id
  socket.on("join_room", (roomId, userId) => {
    console.log("socket: " + socketId + " joined room: " + roomId)
    roomNum = roomId
    socketMap.set(socketId, userId)
    roomMap.set(roomId, socketMap)

    socket.join(roomId)
    const roomMapObject = Array.from(roomMap.entries()).reduce(
      (obj, [key, value]) => {
        obj[key] = Object.fromEntries(value)
        return obj
      },
      {} as any
    )
    console.log("map: " + JSON.stringify(roomMapObject))
  })
  socket.on("disconnect", () => {
    console.log("socket id: " + socketId + " disconnected.")
    console.log(roomNum)
    if (roomNum) {
      socketMap.delete(socketId)
      roomMap.set(roomNum, socketMap)
    }
  })
  // socket.on("send_message", async (data) => {
  //   console.log("send message: " + data.message + " to room: " + data.room)
  //   socket.to(data.room).emit("recieve_message", data.message)
  //   await pool.query("UPDATE editor SET content = $1 WHERE id = $2", [
  //     data.message,
  //     data.room,
  //   ])
  // })
})
io.on("connection_error", (err) => {
  console.log(`connect_error due to ${err.message}`)
})

export { app, server, io }
