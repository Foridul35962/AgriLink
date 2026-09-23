import { Sidebar } from '@/components/sidebar/Sidebar'
import AratdarProvider from '@/providers/AratdarProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-[#f5faf6]">
            <Sidebar />
            <main className="flex-1 p-4 md:ml-64 md:p-6 md:pt-6">
                <AratdarProvider>
                    {children}
                </AratdarProvider>
            </main>
        </div>
    )
}

export default layout