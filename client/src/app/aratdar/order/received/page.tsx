"use client"

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useLanguage } from '@/context/LanguageContext'
import { getAratdarReceiveOrder } from '@/store/slice/orderSlice'
import { AppDispatch, RootState } from '@/store/store'

const AratdarReceivedOrdersPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t } = useLanguage()

    const { aratdarReceiveOrders, orderLoading } = useSelector(
        (state: RootState) => state.order
    )

    const pageParam = searchParams.get('page')
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1

    // URL এ page param না থাকলে default page=1 সেট করবে
    useEffect(() => {
        if (!pageParam) {
            router.replace(`?page=1`)
        }
    }, [pageParam, router])

    useEffect(() => {
        if (aratdarReceiveOrders?.pagination?.currentPage !== currentPage) {
            dispatch(getAratdarReceiveOrder({ page: currentPage }))
        }
    }, [dispatch, currentPage, aratdarReceiveOrders?.pagination?.currentPage])

    const handlePageChange = (newPage: number) => {
        router.push(`?page=${newPage}`)
    }

    const { orders = [], pagination } = aratdarReceiveOrders || {}
    const totalPages = pagination?.totalPages || 1

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                    {t.aratdarReceiveOrders.title}
                </h1>

                {orderLoading ? (
                    <>
                        {/* Table Skeleton - Desktop */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden mb-6">
                            <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex justify-between">
                                <div className="h-4 bg-emerald-200 rounded animate-pulse w-24"></div>
                                <div className="h-4 bg-emerald-200 rounded animate-pulse w-20"></div>
                                <div className="h-4 bg-emerald-200 rounded animate-pulse w-20"></div>
                                <div className="h-4 bg-emerald-200 rounded animate-pulse w-20"></div>
                                <div className="h-4 bg-emerald-200 rounded animate-pulse w-16"></div>
                                <div className="h-4 bg-emerald-200 rounded animate-pulse w-20"></div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {[...Array(5)].map((_, index) => (
                                    <div key={index} className="p-4 flex items-center justify-between animate-pulse">
                                        <div className="flex items-center space-x-3 w-1/4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                                        </div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card Skeleton - Mobile */}
                        <div className="md:hidden space-y-4 mb-6">
                            {[...Array(4)].map((_, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3 animate-pulse"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-emerald-100">
                        {t.aratdarReceiveOrders.noOrders}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-emerald-50/60 text-emerald-900 border-b border-emerald-100">
                                            <th className="p-4 font-semibold">{t.aratdarReceiveOrders.product}</th>
                                            <th className="p-4 font-semibold">{t.aratdarReceiveOrders.orderId}</th>
                                            <th className="p-4 font-semibold">{t.aratdarReceiveOrders.quantity}</th>
                                            <th className="p-4 font-semibold">{t.aratdarReceiveOrders.totalAmount}</th>
                                            <th className="p-4 font-semibold">{t.aratdarReceiveOrders.status}</th>
                                            <th className="p-4 font-semibold">{t.aratdarReceiveOrders.date}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr
                                                key={order._id}
                                                onClick={() => router.push(`/aratdar/order/received/${order._id}`)}
                                                className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                                            >
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        {order.inventoryId?.image?.url ? (
                                                            <Image
                                                                src={order.inventoryId.image.url}
                                                                alt={order.inventoryId.productName}
                                                                width={48}
                                                                height={48}
                                                                className="w-12 h-12 rounded-lg object-cover border border-emerald-100"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 text-xs font-semibold">
                                                                N/A
                                                            </div>
                                                        )}
                                                        <span className="font-medium text-gray-800">
                                                            {order.inventoryId?.productName || 'Unknown Product'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-mono text-gray-600">
                                                    #{order._id.slice(-6)}
                                                </td>
                                                <td className="p-4 text-gray-700">
                                                    {order.quantity} {order.unit}
                                                </td>
                                                <td className="p-4 font-semibold text-emerald-700">
                                                    ৳{order.totalAmount}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 mb-6">
                            {orders.map((order) => (
                                <div
                                    key={order._id}
                                    className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm space-y-3"
                                >
                                    <div className="flex items-center space-x-3">
                                        {order.inventoryId?.image?.url ? (
                                            <Image
                                                src={order.inventoryId.image.url}
                                                alt={order.inventoryId.productName}
                                                width={56}
                                                height={56}
                                                className="w-14 h-14 rounded-lg object-cover border border-emerald-100"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 text-xs font-semibold">
                                                N/A
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {order.inventoryId?.productName || 'Unknown Product'}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono">#{order._id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                                        <span className="text-gray-600">
                                            {order.quantity} {order.unit}
                                        </span>
                                        <span className="font-bold text-emerald-700">৳{order.totalAmount}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            {order.status}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className="px-4 py-2 rounded-lg text-sm font-medium border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {t.aratdarReceiveOrders.previous}
                                </button>
                                <span className="text-sm font-medium text-gray-700">
                                    {t.aratdarReceiveOrders.page} {currentPage} {t.aratdarReceiveOrders.of} {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                    className="px-4 py-2 rounded-lg text-sm font-medium border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {t.aratdarReceiveOrders.next}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default AratdarReceivedOrdersPage