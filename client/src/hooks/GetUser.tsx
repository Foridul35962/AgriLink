"use client"

import { fetchMe } from '@/store/slice/authSlice'
import { AppDispatch } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const GetUser = () => {
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(fetchMe(null))
            } catch (error) {
            }
        }
        fetch()
    }, [])
    return null
}

export default GetUser