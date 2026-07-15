"use client"

import RegisterPage from '@/components/autintacation/RegistrationDesign'
import VerifyOtpPage from '@/components/autintacation/VerifyOtpPage'
import React, { useState } from 'react'

const page = () => {
  const [email, setEmail] = useState("")
  return (
    <>
      {
        !email ? <RegisterPage setEmail={setEmail} /> : <VerifyOtpPage email={email} topic='registration' />
      }
    </>
  )
}

export default page