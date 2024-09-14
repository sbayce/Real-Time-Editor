import React from "react"
import Link from "next/link"
import AvatarDropdown from "./AvatarDropdown"

const Header = () => {

  return (
    <header className="flex justify-between items-center py-4 px-10">
      <Link href="/home" className="fixed pt-8 z-20 font-medium text-xl font-roboto">
        Real-time Editor
      </Link>
      <div className="fixed z-10 right-6 pt-8">
        <AvatarDropdown />
      </div>
    </header>
  )
}

export default Header
