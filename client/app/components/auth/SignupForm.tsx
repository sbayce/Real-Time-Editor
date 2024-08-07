"use client"
import React, { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Input } from "@nextui-org/input"
import { Button } from "@nextui-org/react"

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
      <div className="border rounded-md px-6 py-2 flex flex-col gap-4 text-sm">
        <div>
          <label>Username</label>
          <Input
            required
            variant="underlined"
            type="text"
            isClearable
            onValueChange={setUsername}
          />
        </div>
        <div>
          <label>Email</label>
          <Input
            required
            variant="underlined"
            type="email"
            isClearable
            onValueChange={setEmail}
          />
        </div>
        <div>
          <label>Password</label>
          <Input
            required
            variant="underlined"
            type="password"
            isClearable
            onValueChange={setPassword}
          />
        </div>

        <Button type="submit" color="secondary" variant="solid">
          Sign Up
        </Button>
      </div>
    </form>
  )
}

export default SignupForm
