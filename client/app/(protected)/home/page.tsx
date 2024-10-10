"use client"
import React from "react"
import axios from "axios"
import Workspace from "@/app/components/home/Workspace"
import { useQuery } from "react-query"

const Home = () => {

  const getWorkspace = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/get-workspace`, {
        withCredentials: true,
      })
      return res.data
    } catch (err) {
      console.log(err)
    }
  }
  const {data, isLoading} = useQuery("get-workSpace", getWorkspace)
  
  console.log(data)
  return (
    <div className="py-8 px-2 xs:px-10 md:px-20 lg:px-40 xl:px-80">
      {data && <Workspace owned={data.owned} collaborated={data.collaborated} />}
    </div>
  )
}

export default Home
