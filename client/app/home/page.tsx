"use client"
import React from "react"
import axios from "axios"
import Workspace from "../components/home/Workspace"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"

type WorkSpace = {
  owned: any
  collaborated: any
}

const Home = () => {
  const [workSpace, setWorkSpace] = useState<WorkSpace | null>(null)

  const getWorkspace = async () => {
    try {
      const res = await axios.get("http://localhost:4000/user/get-workspace", {
        withCredentials: true,
      })
      return res.data
    } catch (err) {
      console.log(err)
    }
  }
  const {data, isLoading} = useQuery("get-workSpace", getWorkspace)
  
  console.log(data)
  // owned = owned.length === 0? null : owned
  // collaborated = collaborated.length === 0? null : collaborated
  return (
    <div className="py-8 px-80">
      {/* <h1 className="text-lg font-medium mb-2">Your documents</h1> */}
      {data && <Workspace owned={data.owned} collaborated={data.collaborated} />}
    </div>
  )
}

export default Home
