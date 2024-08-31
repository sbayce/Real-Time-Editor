import React from "react"
import SignupForm from "../components/auth/SignupForm"

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen absolute top-0 left-1/2 right-1/2">
      <SignupForm />
    </div>
  )
}

export default page
