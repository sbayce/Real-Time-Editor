import React from "react"
import SigninForm from "../components/auth/SigninForm"

const page = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen absolute top-0 left-1/2 right-1/2">
          <SigninForm />
      </div>
    </>
  )
}

export default page
