import http from "http"
import { Server } from "socket.io"
import express from "express"
import pool from "../db"
import redisClient from "../redis"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
})

type SocketData = {
  email: string
  username: string
  color: string
}

function generateMutedColor() {
  // Limit the color channels to a middle range to avoid vibrant colors
  const red = Math.floor(Math.random() * 156) + 50;  // Range: 50-205
  const green = Math.floor(Math.random() * 156) + 50; // Range: 50-205
  const blue = Math.floor(Math.random() * 156) + 50;  // Range: 50-205
  
  const color = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
  return color;
}

const roomMap = new Map<string, Map<string, SocketData>>()
const socketMap = new Map<string, SocketData>()
let masterSocket: string | undefined

io.on("connection", (socket) => {
  console.log("new socket: " + socket.id)
  const roomId = socket.handshake.auth.roomId
  const userEmail = socket.handshake.auth.userEmail
  const username = socket.handshake.auth.username
  const socketId = socket.id
  let currentRoomMap = roomMap.get(roomId)
  console.log("current rooms: ", roomMap)
  // if current room exist -> create room and set Master socket (first to join)
  if (!currentRoomMap) {
    masterSocket = socket.id
    let newRoomMap = new Map<string, SocketData>()
    newRoomMap.set(socketId, {
      email: userEmail,
      username: username,
      color: generateMutedColor()
      // color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    })
    roomMap.set(roomId, newRoomMap)
  } else {
    currentRoomMap.set(socketId, {
      email: userEmail,
      username: username,
      color: generateMutedColor()
      // color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    })
    roomMap.set(roomId, currentRoomMap)
  }
  console.log("master: ", masterSocket)
  socket.join(roomId)
  console.log("socket: " + socketId + " joined room: " + roomId)
  console.log(roomMap)

  // get online users from a specific room
  const userMap = roomMap.get(roomId)
  if (userMap) {
    let onlineUsers: any = []
    Array.from(userMap.entries()).forEach(([key, value]) => {
      onlineUsers.push({
        socketId: key,
        email: value.email,
        username: value.username,
        color: value.color,
      })
    })
    console.log("online users: ", onlineUsers)
    io.to(roomId).emit("online_users", onlineUsers)
  }

  socket.on("save-editor", async (content) => {
    console.log("save request from:", socket.id)
    await pool.query("UPDATE editor SET content = $1, updated_at = $2 WHERE id = $3", [
      content,
      new Date(),
      roomId,
    ])
  })

  socket.on("request-latest", () => {
    if(masterSocket && socket.id !== masterSocket){
      io.to(masterSocket).emit("master-request", socket.id)
    }else if(!masterSocket || (masterSocket && masterSocket === socket.id)){
      io.to(socket.id).emit("recieve-master", false)
    }
  })

  socket.on("send-master-content", ({content, requestingSocket}) => {
    io.to(requestingSocket).emit("recieve-master", content)
  })

  socket.on("send-changes", ({ delta, oldDelta, index }) => {
    console.log("index is: ", index)
    console.log("old is: ", oldDelta)

    // index represents page. Set content of a certain page

    // redisClient.json.set(`editor:${roomId}`, `$.content.${index}`, content)
    socket.broadcast.to(roomId).emit("recieve-changes", { delta, index, oldDelta })
  })

  // listen to new pages added
  socket.on("add-page", ({ index }) => {
    socket.broadcast.to(roomId).emit("recieve-page", { index })
  })

  socket.on("remove-page", (index) => {
    // redisClient.json.del(`editor:${roomId}`, `$.content.${index}`) // remove page from redis
    socket.broadcast.to(roomId).emit("page-to-remove", index)
  })

  socket.on("selection-change", ({ selectionIndex, selectionLength, index }) => {
    socket.broadcast.to(roomId).emit("recieve-selection", { selectionIndex, selectionLength, index, senderSocket: socket.id })
  })

  socket.on("send_title", async (title) => {
    await pool.query("UPDATE editor SET title = $1 WHERE id = $2", [
      title,
      roomId,
    ])
    // redisClient.json.set(`editor:${roomId}`, `$.title`, title)
    socket.broadcast.to(roomId).emit("recieve_title", title)
  })

  socket.on("disconnect", async () => {
    console.log("socket id:", socketId, "disconnected from room", roomId)
    let currentRoomMap = roomMap.get(roomId)
    if (currentRoomMap) {
      currentRoomMap.delete(socketId)
      console.log("after leaving: ", roomMap)
      // if master socket leaves -> assign to any existing socket
      if(socket.id === masterSocket){
        const newMasterSocket = [...currentRoomMap.entries()]
        if(newMasterSocket.length !== 0){
          masterSocket = newMasterSocket[0][0]
          console.log("new master socket: ", masterSocket)
        }else{
          masterSocket = undefined
        }
      }
      if (currentRoomMap.size === 0) {
        let updatedContent: any = await redisClient.json.get(
          `editor:${roomId}`,
          {
            path: "$.content",
          }
        )
        if (updatedContent) {
          // check incase cache expires
          // Convert content to JSON string because postgres accepts JSON strings
          updatedContent = updatedContent[0] //remove unnecessary wrapper array
          console.log("alo: ", updatedContent)
          const jsonContent = JSON.stringify(updatedContent)
          await pool.query("UPDATE editor SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
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
    console.log("final rooms: ", roomMap)
    const userMap = roomMap.get(roomId)
    if (userMap) {
      let onlineUsers: any = []
      Array.from(userMap.entries()).forEach(([key, value]) => {
          onlineUsers.push({
          socketId: key,
          email: value.email,
          username: value.username,
          color: value.color,
        })
      })
      io.to(roomId).emit("online_users", onlineUsers)
    }
  })
})

io.engine.on("connection_error", (err) => {
  console.log(err)
})

export { app, server, io }
