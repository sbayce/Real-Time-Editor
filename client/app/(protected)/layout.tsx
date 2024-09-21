"use client"
import getUser from "../lib/user/get-user"
import { useQuery } from "react-query"
import { useRouter } from "next/navigation"
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
    const {data, isLoading} = useQuery("me", getUser)
    const router = useRouter()
    if(isLoading) return <p className="text-center">loading</p>
    if(!data) {
        router.replace('/signin')
        return
    }

  return children
}
