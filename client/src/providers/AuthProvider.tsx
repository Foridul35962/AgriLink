"use client"

import FirstLoad from '@/app/components/loading/FirstLoad'
import { RootState } from '@/store/store'
import { redirect } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { isUserFetch, user } = useSelector((state: RootState) => state.auth)
    if (user && isUserFetch) {
        redirect("/")
    }
    return (
        <>
            {
                !isUserFetch ? <FirstLoad /> : children
            }
        </>
    )
}

export default AuthProvider