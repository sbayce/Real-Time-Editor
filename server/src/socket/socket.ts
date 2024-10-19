import http from "http"
import { Server } from "socket.io"
import express from "express"
import pool from "../db"
import Delta, {Op} from "quill-delta"
import cloudinary from "../lib/cloudinary"

type SocketData = {
  email: string
  username: string
  color: string
}

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
})

function generateRandomColor() {
  const red = Math.floor(Math.random() * 156) + 50
  const green = Math.floor(Math.random() * 156) + 50
  const blue = Math.floor(Math.random() * 156) + 50
  
  const color = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`
  return color
}

const roomMap = new Map<string, Map<string, SocketData>>()
let masterSocket: string | undefined

io.on("connection", (socket) => {
  // retrieve client & room data
  const roomId = socket.handshake.auth.roomId
  const userEmail = socket.handshake.auth.userEmail
  const username = socket.handshake.auth.username
  const socketId = socket.id

  let currentRoomMap = roomMap.get(roomId)
  // if current room doesn't exist -> create room and set Master socket (first to join)
  if (!currentRoomMap) {
    masterSocket = socket.id
    io.to(masterSocket).emit("new:master") // notify client that he became master
    let newRoomMap = new Map<string, SocketData>()
    newRoomMap.set(socketId, {
      email: userEmail,
      username: username,
      color: generateRandomColor()
    })
    roomMap.set(roomId, newRoomMap)
  } else {
    // update room with new client
    currentRoomMap.set(socketId, {
      email: userEmail,
      username: username,
      color: generateRandomColor()
    })
    roomMap.set(roomId, currentRoomMap)
  }
  socket.join(roomId)

  // get all online users in the room
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
    io.to(roomId).emit("online:users", onlineUsers)
  }

  // listens to document saves
  socket.on("save:editor", async (content) => {
    await pool.query("UPDATE editor SET content = $1, updated_at = $2 WHERE id = $3", [
      content,
      new Date(),
      roomId,
    ])
  })

  /* Listens for latest content requests and forwards them to the master socket
      Newly joined clients request latest content from the master.
      If master doesn't exist then client is notified */
  socket.on("request:latest", () => {
    if(masterSocket && socket.id !== masterSocket){
      io.to(masterSocket).emit("master:request", socket.id)
    }else if(!masterSocket || (masterSocket && masterSocket === socket.id)){
      io.to(socket.id).emit("recieve:master", false)
    }
  })

  // Listens to content from master and forwards to requesting clients
  socket.on("send:master:content", ({content, requestingSocket}) => {
    io.to(requestingSocket).emit("recieve:master", content)
  })

  // listens to document changes
  socket.on("send:changes", async ({ delta, oldDelta, index } : {delta: Delta, oldDelta: Delta, index: number}) => {

    socket.broadcast.to(roomId).emit("recieve:changes", { delta, index, oldDelta })

    let containsImage = false
    let baseDelta
    let invertDelta

    // Create an array to hold promises for image uploads
    const uploadPromises = delta.ops.map(async (op: Op, idx: number) => {
      if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
          containsImage = true
          baseDelta = new Delta(oldDelta).compose(delta)
          invertDelta = new Delta(delta).invert(baseDelta)
          const img = (op.insert as { image: string }).image
          try {
              const result = await cloudinary.uploader.upload(img, { public_id: `${roomId}:${index}` })
              delta.ops[idx].insert = { image: result.secure_url }
          } catch (error) {
              console.error("Image upload failed:", error)
          }
      }
    })
    if(containsImage){
      // Wait for all image uploads to complete
      await Promise.all(uploadPromises)

      invertDelta = new Delta(invertDelta).compose(delta)
      try {
          io.to(roomId).emit("recieve:changes", { delta: invertDelta, index, oldDelta: baseDelta })
      } catch (error) {
          console.error("Database update failed:", error)
      }
      }
  })

  // listens to newly added pages
  socket.on("add:page", ({ index }) => {
    socket.broadcast.to(roomId).emit("recieve:page", { index })
  })

  // listens to removed pages
  socket.on("remove:page", (index) => {
    socket.broadcast.to(roomId).emit("page:to:remove", index)
  })

  // listens to selection changes
  socket.on("selection:change", ({ selectionIndex, selectionLength, index }) => {
    socket.broadcast.to(roomId).emit("recieve:selection", { selectionIndex, selectionLength, index, senderSocket: socket.id })
  })

  socket.on("send:title", async (title) => {
    await pool.query("UPDATE editor SET title = $1 WHERE id = $2", [
      title,
      roomId,
    ])
    socket.broadcast.to(roomId).emit("recieve:title", title)
  })

  socket.on("disconnect", async () => {
    let currentRoomMap = roomMap.get(roomId)
    if (currentRoomMap) {
      currentRoomMap.delete(socketId)
      // if master socket leaves -> assign to any existing socket
      if(socket.id === masterSocket){
        const newMasterSocket = [...currentRoomMap.entries()]
        if(newMasterSocket.length !== 0){
          masterSocket = newMasterSocket[0][0]
          io.to(masterSocket).emit("new:master") // notify client that he became master
        }else{
          masterSocket = undefined
        }
      }
      // delete room if its empty
      if (currentRoomMap.size === 0) {
        roomMap.delete(roomId)
      } else {
        roomMap.set(roomId, currentRoomMap)
      }
    }

    const userMap = roomMap.get(roomId)

    // get all online users in the room
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
      io.to(roomId).emit("online:users", onlineUsers)
    }
  })
})

io.engine.on("connection_error", (err) => {
  console.log(err)
})

export { app, server, io }
