"use client"
import getUser from "../lib/user/get-user"
import { useQuery } from "react-query"
import { useRouter, usePathname } from "next/navigation"
export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathName = usePathname()
    const {data, isLoading} = useQuery("me", getUser)
    const router = useRouter()
    if(isLoading) return undefined
    if(!data && pathName !== '/signin' && pathName !== '/signup') {
        router.replace('/signin')
        return
    }
    if(data && !isLoading && (pathName === '/signup' || pathName === '/signin')){
      return router.replace('/home')
    }

  return children
}
