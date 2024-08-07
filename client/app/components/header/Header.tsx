"use client"
import React from "react"
import {
  User,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  cn,
} from "@nextui-org/react"
import Link from "next/link"
import { useQuery } from "react-query"
import getUser from "@/app/lib/user/get-user"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useQueryClient } from "react-query"

const Header = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data, isLoading } = useQuery("me", getUser)
  
  const handleLogout = async() => {
    try{
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {}, {withCredentials: true})
      queryClient.invalidateQueries("me")
      queryClient.invalidateQueries("get-workSpace")
      router.replace("/signin")
    }catch(e: any){
      console.log(e.message)
    }
  }

  return (
    <header className="flex justify-between items-center py-4 px-10">
      <Link href="/home" className="fixed pt-8 z-20 font-medium text-xl font-roboto">
        Real-time Editor
      </Link>
      {isLoading && <p className="text-sm">loading...</p>}
      <div className="fixed z-10 right-2 pt-8">
      {data ? (
        <div className="flex flex-col">
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                color="secondary"
                name={data.username}
                className="cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu onAction={(key) => {
              if(key === 'logout') handleLogout()
            }}>
              <DropdownSection>
                <DropdownItem>
                  <div className="flex flex-col gap-2">
                    <p>{data.username}</p>
                    <p>{data.email}</p>
                  </div>
                </DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                >
                  Logout
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>

          {/* <User name={data.username} description={data.email} /> */}
        </div>
      ) : (
        !isLoading && <Button onClick={() => router.replace("/signin")}>Login</Button>
      )}
      </div>
      
    </header>
  )
}

export default Header
