import React from "react"
import axios from "axios"
import { cookies } from "next/headers"
import Workspace from "../components/home/Workspace"

const Home = async () => {
  const getWorkspace = async () => {
    try {
      const cookieHeader = cookies().toString() // Extract cookies from incoming request
      const res = await axios.get("http://localhost:4000/user/get-workspace", {
        headers: {
          Cookie: cookieHeader, // Pass the cookies in the request headers
        },
        withCredentials: true,
      })
      return res.data
    } catch (err) {
      console.log(err)
    }
  }
  let {owned, collaborated} = await getWorkspace()
  owned = owned.length === 0? null : owned
  collaborated = collaborated.length === 0? null : collaborated
  return (
    <div className="py-8 px-60">
      {/* <h1 className="text-lg font-medium mb-2">Your documents</h1> */}
      <Workspace owned={owned} collaborated={collaborated} />
    </div>
  )
}

export default Home
