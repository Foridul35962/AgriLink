import AratdarProvider from '@/providers/AratdarProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <AratdarProvider>
                {children}
            </AratdarProvider>
        </>
    )
}

export default layout