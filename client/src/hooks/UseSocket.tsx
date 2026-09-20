"use client"

import socket from '@/socket'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const UseSocket = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        if (!user) {
            return
        }

        if (!socket.connected) {
            socket.connect()
        }

        const onConnect = () => {
            socket.emit("joinUser", { userId: user._id })
        }

        socket.on("connect", onConnect)

        return () => {
            socket.off("connect", onConnect)
        }
    }, [user?._id, dispatch])

    return null
}

export default UseSocket