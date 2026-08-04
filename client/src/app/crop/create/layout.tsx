import AdminProvider from '@/providers/AdminProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <AdminProvider>
                {children}
            </AdminProvider>
        </>
    )
}

export default layout