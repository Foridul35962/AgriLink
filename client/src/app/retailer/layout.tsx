import { Sidebar } from '@/components/sidebar/Sidebar'
import RetailerProvider from '@/providers/RetailerProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-[#f5faf6]">
            <Sidebar />
            <main className="flex-1 p-4 md:ml-64 md:p-6 md:pt-6">
                <RetailerProvider>
                    {children}
                </RetailerProvider>
            </main>
        </div>
    )
}

export default layout