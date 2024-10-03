"use client"
import React, { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Input } from "@nextui-org/input"
import { Button, Divider } from "@nextui-org/react"
import Link from "next/link"

const SignupForm = () => {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault()
      await axios
        .post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/signup`,
          {
            username: username,
            email: email,
            password: password,
          },
          { withCredentials: true }
        )
        .then(() => {
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
    <form onSubmit={handleSignUp}>
      <div className="p-20 flex flex-col gap-4 text-sm w-[30rem]">
      <h1 className="text-gray-400 text-3xl">Sign up</h1>
        <div>
          <label>Username</label>
          <Input
            required
            variant="faded"
            type="text"
            isClearable
            onValueChange={setUsername}
            radius="sm"
          />
        </div>
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

        <Button className="self-end mt-4 bg-black text-white" type="submit" radius="sm" variant="solid">
          Sign Up
        </Button>
        <Divider />
        <div className="flex justify-between mt-4">
          <p className="text-gray-600">Already have an account</p>
          <Link href="/signin" className="text-blue-800">Sign in</Link>
        </div>
      </div>
    </form>
  )
}

export default SignupForm
