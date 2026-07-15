"use client"

import ForgetPassDesign from '@/app/components/autintacation/ForgetPassDesign'
import ResetPassPage from '@/app/components/autintacation/ResetPassPage'
import VerifyOtpPage from '@/app/components/autintacation/VerifyOtpPage'
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