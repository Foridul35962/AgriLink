"use client"

import ForgetPassDesign from '@/components/autintacation/ForgetPassDesign'
import ResetPassPage from '@/components/autintacation/ResetPassPage'
import VerifyOtpPage from '@/components/autintacation/VerifyOtpPage'
import React, { useState } from 'react'

const page = () => {
    const [email, setEmail] = useState("")
    const [isVerified, setIsverified] = useState(false)
    return (
        <>
            {
                !email ? <ForgetPassDesign setEmail={setEmail} /> : (
                    !isVerified ? <VerifyOtpPage topic='forgetPass' email={email} setIsverified={setIsverified} setEmail={setEmail} /> :
                        <ResetPassPage email={email} />
                )
            }
        </>
    )
}

export default page