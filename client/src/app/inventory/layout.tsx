import InventoryProvider from '@/providers/InventoryProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <InventoryProvider>
                {children}
            </InventoryProvider>
        </>
    )
}

export default layout