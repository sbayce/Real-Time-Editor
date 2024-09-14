'use client'
import React from 'react'
import {
    User,
    Avatar,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem,
  } from "@nextui-org/react"
  import { useQuery } from "react-query"
  import getUser from "@/app/lib/user/get-user"
  import axios from "axios"
  import { useRouter } from "next/navigation"
  import { useQueryClient } from "react-query"

const AvatarDropdown = () => {
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
    if(!data && isLoading) return (<p className="text-md">loading...</p>)
    if(!data && !isLoading) return (<Button onClick={() => router.replace("/signin")}>Login</Button>)
    return (
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
  )
}

export default AvatarDropdown