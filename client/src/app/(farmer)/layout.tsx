import FarmerProvider from '@/providers/FarmerProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <FarmerProvider>
                {children}
            </FarmerProvider>
        </>
    )
}

export default layout