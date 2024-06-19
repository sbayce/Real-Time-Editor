import React from "react"
import SignupForm from "../components/auth/SignupForm"

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex flex-col ">
        <h1 className="text-xl font-medium">Create. Collaborate.</h1>
        <h1 className="text-gray-400">Create your account.</h1>
      </div>
      <SignupForm />
    </div>
  )
}

export default page
