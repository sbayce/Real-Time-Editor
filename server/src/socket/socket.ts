import http from "http"
import { Server } from "socket.io"
import express from "express"
import pool from "../db"
import redisClient from "../redis"
import Delta, {Op} from "quill-delta"
import cloudinary from "../lib/cloudinary"

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
  // if current room doesn't exist -> create room and set Master socket (first to join)
  if (!currentRoomMap) {
    masterSocket = socket.id
    io.to(masterSocket).emit("new:master") // notify client that he became master
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
    io.to(roomId).emit("online:users", onlineUsers)
  }

  socket.on("save:editor", async (content) => {
    console.log("save request from:", socket.id)
    await pool.query("UPDATE editor SET content = $1, updated_at = $2 WHERE id = $3", [
      content,
      new Date(),
      roomId,
    ])
  })

  socket.on("request:latest", () => {
    if(masterSocket && socket.id !== masterSocket){
      io.to(masterSocket).emit("master:request", socket.id)
    }else if(!masterSocket || (masterSocket && masterSocket === socket.id)){
      io.to(socket.id).emit("recieve:master", false)
    }
  })

  socket.on("send:master:content", ({content, requestingSocket}) => {
    io.to(requestingSocket).emit("recieve:master", content)
  })

  socket.on("send:changes", async ({ delta, oldDelta, index } : {delta: Delta, oldDelta: Delta, index: number}) => {
    console.log("index is: ", index)

    socket.broadcast.to(roomId).emit("recieve:changes", { delta, index, oldDelta })
    console.log("Delta before: ", delta)
    let containsImage = false
    let baseDelta
    let invertDelta
    // Create an array to hold promises for image uploads
    const uploadPromises = delta.ops.map(async (op: Op, idx: number) => {
      if (op.insert && typeof op.insert === 'object' && 'image' in op.insert) {
          containsImage = true
          baseDelta = new Delta(oldDelta).compose(delta)
          invertDelta = new Delta(delta).invert(baseDelta)
          const img = (op.insert as { image: string }).image;
          try {
              const result = await cloudinary.uploader.upload(img, { public_id: `${roomId}:${index}` });
              console.log("b4:", op.insert);
              delta.ops[idx].insert = { image: result.secure_url };
              console.log("updated delta:", delta.ops[idx].insert);
          } catch (error) {
              console.error("Image upload failed:", error);
          }
      }
    });
    if(containsImage){
      console.log("contains img")
      // Wait for all image uploads to complete
      await Promise.all(uploadPromises);

      invertDelta = new Delta(invertDelta).compose(delta)
      const updatedContent = new Delta(oldDelta).compose(delta);
      console.log("old: ", oldDelta);
      console.log("delta: ", delta);
      try {
          io.to(roomId).emit("recieve:changes", { delta: invertDelta, index, oldDelta: baseDelta })
      } catch (error) {
          console.error("Database update failed:", error);
      }
      }
  })

  // listen to new pages added
  socket.on("add:page", ({ index }) => {
    socket.broadcast.to(roomId).emit("recieve:page", { index })
  })

  socket.on("remove:page", (index) => {
    // redisClient.json.del(`editor:${roomId}`, `$.content.${index}`) // remove page from redis
    socket.broadcast.to(roomId).emit("page:to:remove", index)
  })

  socket.on("selection:change", ({ selectionIndex, selectionLength, index }) => {
    socket.broadcast.to(roomId).emit("recieve:selection", { selectionIndex, selectionLength, index, senderSocket: socket.id })
  })

  socket.on("send:title", async (title) => {
    await pool.query("UPDATE editor SET title = $1 WHERE id = $2", [
      title,
      roomId,
    ])
    // redisClient.json.set(`editor:${roomId}`, `$.title`, title)
    socket.broadcast.to(roomId).emit("recieve:title", title)
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
          io.to(masterSocket).emit("new:master") // notify client that he became master
          console.log("new master socket: ", masterSocket)
        }else{
          masterSocket = undefined
        }
      }
      if (currentRoomMap.size === 0) {
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
      io.to(roomId).emit("online:users", onlineUsers)
    }
  })
})

io.engine.on("connection_error", (err) => {
  console.log(err)
})

export { app, server, io }
