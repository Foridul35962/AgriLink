import RetailerProvider from '@/providers/RetailerProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <RetailerProvider>
                {children}
            </RetailerProvider>
        </>
    )
}

export default layout