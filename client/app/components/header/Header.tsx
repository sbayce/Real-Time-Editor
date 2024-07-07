"use client"
import React from "react"
import { User, Avatar, Button } from "@nextui-org/react"
import Link from "next/link"
import { useQuery } from "react-query"
import getUser from "@/app/lib/user/get-user"

const Header = () => {
  const {data, isLoading} = useQuery("me", getUser)
  return (
    <header className="bg-gray-100 flex justify-between items-center py-2 px-10 border-b-1">
      <Link href="/home">Real-time Editor</Link>
      {isLoading && <p className="text-sm">loading...</p>}
      {data? <div className="flex flex-col">
        <Avatar color="secondary" name={data.username} />
        {/* <User name={data.username} description={data.email} /> */}
      </div> :
      (!isLoading && <Button>Login</Button>)
      }
      
    </header>
  )
}

export default Header
