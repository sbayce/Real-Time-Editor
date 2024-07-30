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

const Header = () => {
  const { data, isLoading } = useQuery("me", getUser)
  return (
    <header className="flex justify-between items-center py-4 px-10">
      <Link href="/home" className="fixed pt-8 z-20 font-medium text-xl font-mirza">
        Real-time Editor
      </Link>
      {isLoading && <p className="text-sm">loading...</p>}
      {data ? (
        <div className="flex flex-col">
          <Dropdown>
            <DropdownTrigger className="fixed right-2 pt-8">
              <Avatar
                color="secondary"
                name={data.username}
                className="cursor-pointer"
              />
            </DropdownTrigger>
            <DropdownMenu>
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
        !isLoading && <Button>Login</Button>
      )}
    </header>
  )
}

export default Header
