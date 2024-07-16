import http from "http"
import { Server } from "socket.io"
import express from "express"
import pool from "../db"
import redisClient from "../redis"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

type SocketData ={
  email: string,
  username: string,
  color: string
}

const roomMap = new Map<string, Map<string, SocketData>>()
const socketMap = new Map<string, SocketData>()

function logRoomMap(roomMap: Map<string, Map<string, SocketData>>): void {
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
  const username = socket.handshake.auth.username
  const socketId = socket.id
  let currentRoomMap = roomMap.get(roomId)
  if (!currentRoomMap) {
    var newRoomMap = new Map<string, SocketData>()
    newRoomMap.set(socketId, {email: userEmail, username: username, color: "#" + Math.floor(Math.random()*16777215).toString(16)})
    roomMap.set(roomId, newRoomMap)
  } else {
    currentRoomMap?.set(socketId, {email: userEmail, username: username, color: "#" + Math.floor(Math.random()*16777215).toString(16)})
    roomMap.set(roomId, currentRoomMap)
  }
  // socketMap.set(socketId, userEmail)
  // roomMap.set(roomId, socketMap)
  socket.join(roomId)
  console.log("socket: " + socketId + " joined room: " + roomId)
  logRoomMap(roomMap)

  // get online users from a specific room
  const userMap = roomMap.get(roomId)
  if (userMap) {
    const data = Array.from(userMap.entries())
    console.log("data: ", data)
    let onlineUsers: any = []
    Array.from(userMap.entries()).forEach(([key, value]) => {
      onlineUsers.push({
        socketId: key,
        email: value.email,
        username: value.username,
        color: value.color
      })
    })
    console.log("online users: ", onlineUsers)
    io.to(roomId).emit("online_users", onlineUsers)
  }

  socket.on("send-changes", async ({ delta, content, index }) => {
    // await pool.query("UPDATE editor SET content = $1 WHERE id = $2", [
    //   content,
    //   roomId,
    // ])
    console.log("index is: ", index)

    // index represents page. Set content of a certain page
    redisClient.json.set(`editor:${roomId}`, `$.content.${index}`, content)
    socket.broadcast.to(roomId).emit("recieve-changes", {delta, index})
  })

  // listen to new pages added
  socket.on("add-page", ({index}) => {
    socket.broadcast.to(roomId).emit("recieve-page", {index})
  })

  socket.on("selection-change", ({selectionIndex, selectionLength, index}) => {
    socket.broadcast.to(roomId).emit("recieve-selection", {selectionIndex, selectionLength, index, senderSocket: socket.id})
  })
  socket.on("replace-selection", ({selectionIndex, selectionLength, oldRange, index}) => {
    socket.broadcast.to(roomId).emit("replace-selection", {selectionIndex, selectionLength, oldRange, index, senderSocket: socket.id})
  })
  socket.on("remove-selection", ({oldRange, index}) => {
    socket.broadcast.to(roomId).emit("remove-selection", {oldRange, index})
  })
  socket.on("cursor-update", ({selectionIndex, selectionLength, index}) => {
    socket.broadcast.to(roomId).emit("recieve-cursor", {selectionIndex, selectionLength, index, senderSocket: socket.id})
  })

  socket.on("send_title", async (title) => {
    await pool.query("UPDATE editor SET title = $1 WHERE id = $2", [
      title,
      roomId,
    ])
    socket.broadcast.to(roomId).emit("recieve_title", title)
  })

  socket.on("disconnect", async() => {
    console.log("socket id: " + socketId + " disconnected.")
    console.log(roomId)
    var currentRoomMap = roomMap.get(roomId)
    if (currentRoomMap) {
      currentRoomMap.delete(socketId)
      if (currentRoomMap.size === 0) {
        let updatedContent: any = await redisClient.json.get(`editor:${roomId}`, {
          path: "$.content"
        })
        if(updatedContent){ // check incase cache expires
          // Convert content to JSON string because postgres accepts JSON strings
          updatedContent = updatedContent[0] //remove unnecessary wrapper array
          console.log("alo: ", updatedContent)
          const jsonContent = JSON.stringify(updatedContent);
          await pool.query("UPDATE editor SET content = $1 WHERE id = $2", [
            jsonContent,
            roomId,
          ])
        }
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
