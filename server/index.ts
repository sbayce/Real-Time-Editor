import express from "express"
import dotenv from "dotenv"
import authRouter from "./routes/auth"
import * as bodyParser from "body-parser"

dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

app.use("/auth", authRouter)
app.get("/", (req, res) => {
  res.send("aloo")
})

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
