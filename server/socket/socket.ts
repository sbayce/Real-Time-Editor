import http from "http"
import { Server } from "socket.io"
import express from "express"

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

function logRoomMap(roomMap: Map<string, Map<string, string>>): void {
  roomMap.forEach((innerMap, room) => {
    console.log(`Room: ${room}`)
    innerMap.forEach((user, socket) => {
      console.log(`  User: ${user}, Socket: ${socket}`)
    })
  })
}

io.on("connection", (socket) => {
  console.log("new socket: " + socket.id)
  const roomId = socket.handshake.auth.roomId
  const userEmail = socket.handshake.auth.userEmail
  const socketId = socket.id
  let currentRoomMap = roomMap.get(roomId)
  if (!currentRoomMap) {
    var newRoomMap = new Map<string, string>()
    newRoomMap.set(socketId, userEmail)
    roomMap.set(roomId, newRoomMap)
  } else {
    currentRoomMap?.set(socketId, userEmail)
    roomMap.set(roomId, currentRoomMap)
  }
  // socketMap.set(socketId, userEmail)
  // roomMap.set(roomId, socketMap)
  socket.join(roomId)
  console.log("socket: " + socketId + " joined room: " + roomId)
  logRoomMap(roomMap)
  const userMap = roomMap.get(roomId)
  if (userMap) {
    const userEmails = Array.from(userMap.values())
    io.to(roomId).emit("online_users", userEmails)
  }

  socket.on("disconnect", () => {
    console.log("socket id: " + socketId + " disconnected.")
    console.log(roomId)
    var currentRoomMap = roomMap.get(roomId)
    if (currentRoomMap) {
      currentRoomMap.delete(socketId)
      if (currentRoomMap.size === 0) {
        // delete room if its empty
        roomMap.delete(roomId)
      } else {
        roomMap.set(roomId, currentRoomMap)
      }
    }
    // socketMap.delete(socketId)
    // roomMap.set(roomId, socketMap)
    logRoomMap(roomMap)
    const userMap = roomMap.get(roomId)
    if (userMap) {
      const userEmails = Array.from(userMap.values())
      io.to(roomId).emit("online_users", userEmails)
    }
  })
})

io.on("connection_error", (err) => {
  console.log(`connect_error due to ${err.message}`)
})

export { app, server, io }
