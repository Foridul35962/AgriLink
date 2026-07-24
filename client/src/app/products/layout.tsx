import ProductProvider from '@/providers/ProductProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ProductProvider >
                {children}
            </ProductProvider>
        </>
    )
}

export default layout