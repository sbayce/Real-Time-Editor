"use client"
import React, { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Input } from "@nextui-org/input"
import { Button } from "@nextui-org/react"

const SigninForm = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignin = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault()
      await axios
        .post(
          "http://localhost:4000/auth/signin",
          {
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
    <form onSubmit={handleSignin}>
      <div className="border rounded-md px-6 py-2 flex flex-col gap-4 text-sm">
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
          Sign In
        </Button>
      </div>
    </form>
  )
}

export default SigninForm