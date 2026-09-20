"use client"

import GetUser from '@/hooks/GetUser'
import UseSocket from '@/hooks/UseSocket'
import store from '@/store/store'
import React from 'react'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Provider store={store}>
        <ToastContainer />
        <UseSocket />
        {children}
        <GetUser />
      </Provider>
    </>
  )
}

export default AppProvider