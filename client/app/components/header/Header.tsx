import React from "react"
import { User } from "@nextui-org/react"
import Link from "next/link"

const Header = () => {
  return (
    <header className="bg-gray-100 flex justify-between items-center p-2 border-b-1">
      <Link href="/home">Real-time Editor</Link>
      <div className="flex flex-col">
        <User name="sbace" description="sbace@gmail.com" />
      </div>
    </header>
  )
}

export default Header
