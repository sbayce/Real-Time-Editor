import React from "react"
import SigninForm from "../components/auth/SigninForm"

const page = () => {
  return (
    <>
      <div className="border border-b-gray-400 p-2">header</div>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col ">
          <h1 className="text-xl font-medium">Create. Collaborate.</h1>
          <h1 className="text-gray-400">Log in.</h1>
        </div>
        <SigninForm />
      </div>
    </>
  )
}

export default page
