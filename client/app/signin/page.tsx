import React from "react"
import SigninForm from "../components/auth/SigninForm"

const page = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="flex flex-col ">
          {/* <h1 className="text-xl font-medium">Create. Collaborate.</h1> */}
          <h1 className="text-gray-400">Log in.</h1>
        </div>
        <SigninForm />
      </div>
    </>
  )
}

export default page
