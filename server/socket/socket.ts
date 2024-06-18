import http from "http"
import { Server } from "socket.io"
import express from "express"
import pool from "../db"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    console.log("joined room: " + data)
    socket.join(data)
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
