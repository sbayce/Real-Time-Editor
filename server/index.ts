import express from "express"
import dotenv from "dotenv"
import authRouter from "./routes/auth"
import cors from "cors"
import * as bodyParser from "body-parser"
import { Pool } from "pg"
import pool from "./db"
import isAuthenticated from "./middleware/auth"
import userRouter from "./routes/user"
import cookieParser from "cookie-parser"
import { app, server } from "./socket/socket"
import editorRouter from "./routes/editor"

declare global {
  namespace Express {
    interface Request {
      context: {
        postgres: Pool
      }
      userId?: string
    }
  }
}

dotenv.config()

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
)

app.use(express.json())
app.use((req, res, next) => {
  try {
    req.context = {
      postgres: pool,
    }
    next()
  } catch (error) {
    return res.status(400).json({
      message: "Postgres initialization failure",
    })
  }
})

app.use("/auth", authRouter)
app.use(isAuthenticated)
app.use("/user", userRouter)
app.use("/editor", editorRouter)

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
