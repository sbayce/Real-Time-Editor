"use client"
import React, { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Input } from "@nextui-org/input"
import { Button, Divider } from "@nextui-org/react"
import { useQueryClient } from "react-query"
import Link from "next/link"

const SigninForm = () => {
  const queryClient = useQueryClient()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignin = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault()
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signin`,
          {
            email: email,
            password: password,
          },
          { withCredentials: true }
        )
        .then(() => {
          queryClient.invalidateQueries('me')
          router.push("/home")
        })
        .catch((err) => {
          throw new Error(err)
        })
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <form onSubmit={handleSignin}>
      <div className="p-20 flex flex-col gap-4 text-sm w-[30rem]">
        <h1 className="text-gray-400 text-3xl">Sign in</h1>
        <div>
          <label>Email</label>
          <Input
            required
            variant="faded"
            type="email"
            isClearable
            onValueChange={setEmail}
            radius="sm"
          />
        </div>
        <div>
          <label>Password</label>
          <Input
            required
            variant="faded"
            type="password"
            isClearable
            onValueChange={setPassword}
            radius="sm"
          />
        </div>

        <Button className="self-end mt-4 bg-black text-white" radius="sm" type="submit" variant="solid">
          Sign In
        </Button>
        <Divider />
        <div className="flex justify-between mt-4">
          <p className="text-gray-600">No account yet</p>
          <Link href="/signup" className="text-blue-800">Sign up</Link>
        </div>
      </div>
    </form>
  )
}

export default SigninForm
