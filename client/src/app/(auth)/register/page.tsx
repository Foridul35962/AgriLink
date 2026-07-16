"use client"

import RegisterPage from '@/components/autintacation/RegistrationDesign'
import RegistrationPendingPage from '@/components/autintacation/RegistrationPending'
import VerifyOtpPage from '@/components/autintacation/VerifyOtpPage'
import React, { useState } from 'react'

const page = () => {
  const [email, setEmail] = useState("")
  const [isverified, setIsverified] = useState(false)
  return (
    <>
      {
        !email ? <RegisterPage setEmail={setEmail} /> : (
          !isverified ? <VerifyOtpPage email={email} topic='registration' setIsverified={setIsverified} /> :
            <RegistrationPendingPage />
        )
      }
    </>
  )
}

export default page