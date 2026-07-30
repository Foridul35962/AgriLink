'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useLanguage } from '@/context/LanguageContext'
import { getFarmerReceiveOrders } from '@/store/slice/orderSlice'
import { AppDispatch, RootState } from '@/store/store'
import {
    Package,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ShoppingBag,
    ArrowUpRight,
    Layers,
    Leaf,
    BookOpen,
    Clock,
    CheckCircle2,
    RefreshCw,
    XCircle,
    CircleDot
} from 'lucide-react'
import Link from 'next/link'

const Page = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const dispatch = useDispatch<AppDispatch>()

    const { t } = useLanguage()
    const { orderLoading, farmerReceiveOrders } = useSelector((state: RootState) => state.order)

    // URL query parameter management
    const pageQuery = searchParams.get('page')
    const currentPage = pageQuery ? parseInt(pageQuery, 10) : 1

    // Set default page=1 in URL query if not present
    useEffect(() => {
        if (!pageQuery) {
            const params = new URLSearchParams(searchParams.toString())
            params.set('page', '1')
            router.replace(`?${params.toString()}`, { scroll: false })
        }
    }, [pageQuery, router, searchParams])

    // Fetch orders when page query changes
    useEffect(() => {
        if (pageQuery && farmerReceiveOrders?.pagination?.currentPage !== currentPage) {
            dispatch(getFarmerReceiveOrders({ page: currentPage }))
        }
    }, [dispatch, pageQuery, currentPage, farmerReceiveOrders?.pagination?.currentPage])

    // Navigation handlers
    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`?${params.toString()}`)
    }

    // Helper for Status Stamp styling
    const getStatusBadge = (status: string) => {
        const stampStyles: Record<string, { text: string; border: string; bg: string; icon: React.ElementType }> = {
            PENDING: { text: 'text-[#4B7C5E]', border: 'border-[#4B7C5E]/50', bg: 'bg-[#4B7C5E]/5', icon: Clock },
            CONFIRMED: { text: 'text-[#1F7A4B]', border: 'border-[#1F7A4B]/60', bg: 'bg-[#1F7A4B]/5', icon: CircleDot },
            PROCESSING: { text: 'text-[#146C43]', border: 'border-[#146C43]/60', bg: 'bg-[#146C43]/5', icon: RefreshCw },
            DELIVERED: { text: 'text-[#0F3D2E]', border: 'border-[#0F3D2E]/70', bg: 'bg-[#0F3D2E]/5', icon: CheckCircle2 },
            CANCELLED: { text: 'text-[#6B7280]', border: 'border-[#6B7280]/50', bg: 'bg-[#6B7280]/5', icon: XCircle },
        }

        const config = stampStyles[status] || { text: 'text-[#4B5D53]', border: 'border-[#4B5D53]/40', bg: 'bg-[#4B5D53]/5', icon: CircleDot }
        const Icon = config.icon

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border-2 border-double ${config.border} ${config.text} ${config.bg} text-[10px] font-bold uppercase tracking-widest -rotate-6 shadow-sm group-hover:-rotate-3 transition-transform duration-300 select-none`}
            >
                <Icon size={11} strokeWidth={2.5} />
                {status}
            </span>
        )
    }

    return (
        <div
            className="min-h-screen bg-[#F3F9F5] py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased"
            style={{
                backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(15,61,46,0.05) 0px, rgba(15,61,46,0.05) 1px, transparent 1px, transparent 34px)',
            }}
        >
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Ledger Cover Header */}
                <div className="relative overflow-hidden bg-[#0F3D2E] rounded-2xl border border-[#0B2E22] shadow-xl shadow-[#0B2E22]/20">
                    <div className="absolute left-0 top-0 bottom-0 w-3 border-r-2 border-dashed border-white/25" />
                    <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 pl-8 pr-6 py-8 sm:pl-12 sm:pr-10 sm:py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 text-white/80 text-xs font-bold tracking-[0.2em] uppercase">
                                <Leaf size={14} />
                                <span>AgriLink Farmer Ledger</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                {t.farmerReceiveOrders.title}
                            </h1>
                            <p className="text-sm sm:text-base text-white/70 max-w-xl leading-relaxed">
                                {t.farmerReceiveOrders.subtitle}
                            </p>
                        </div>

                        {/* Total Orders Badge */}
                        {farmerReceiveOrders?.pagination?.totalOrders !== undefined && (
                            <div className="flex items-center gap-4 bg-white/10 border border-white/20 p-4 rounded-xl shrink-0 backdrop-blur-sm">
                                <div className="p-2.5 bg-white/15 rounded-lg text-white border border-white/25">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">
                                        {t.farmerReceiveOrders.ledgerEntries}
                                    </p>
                                    <p className="text-xl font-bold text-white tracking-tight">
                                        {farmerReceiveOrders.pagination.totalOrders}
                                        <span className="text-sm font-normal text-white/60"> {t.farmerReceiveOrders.placed}</span>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                {orderLoading ? (
                    /* Skeleton Loading UI */
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-xl p-5 border-2 border-dashed border-[#0F3D2E]/15 animate-pulse flex flex-col md:flex-row items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#0F3D2E]/8 rounded-xl shrink-0" />
                                    <div className="space-y-2.5 w-full md:w-56">
                                        <div className="h-3 bg-[#0F3D2E]/10 rounded w-24" />
                                        <div className="h-5 bg-[#0F3D2E]/10 rounded w-44" />
                                        <div className="h-3 bg-[#0F3D2E]/8 rounded w-32" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-[#0F3D2E]/10">
                                    <div className="h-8 bg-[#0F3D2E]/8 rounded w-24" />
                                    <div className="h-7 bg-[#0F3D2E]/8 rounded-full w-28" />
                                    <div className="h-10 bg-[#0F3D2E]/8 rounded-xl w-10" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !farmerReceiveOrders?.orders || farmerReceiveOrders.orders.length === 0 ? (

                    /* Empty State */
                    <div className="bg-white rounded-2xl border-2 border-dashed border-[#0F3D2E]/20 p-12 sm:p-16 text-center flex flex-col items-center justify-center my-6">
                        <div className="w-20 h-20 bg-[#0F3D2E]/8 text-[#0F3D2E] rounded-2xl flex items-center justify-center mb-5 border border-[#0F3D2E]/15">
                            <Package size={36} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-[#142B20] mb-2">
                            {t.farmerReceiveOrders.noOrders}
                        </h3>
                        <p className="text-[#4B5D53] text-sm max-w-md leading-relaxed">
                            {t.farmerReceiveOrders.noOrdersSub}
                        </p>
                    </div>
                ) : (

                    /* Ledger Row List */
                    <div className="bg-white rounded-2xl border border-[#0F3D2E]/12 shadow-sm overflow-hidden">
                        {farmerReceiveOrders.orders.map((order, idx) => (
                            <Link
                                key={order._id}
                                href={`/receive-order/${order._id}`}
                                className={`group relative hover:bg-[#F3F9F5] px-4 sm:px-6 py-5 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-300 ${idx !== 0 ? "border-t-2 border-dashed border-[#0F3D2E]/12" : ""}`}
                            >
                                {/* Left: Image & Product Details */}
                                <div className="flex items-center gap-4 w-full md:w-1/2">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F3F9F5] border-2 border-[#0F3D2E]/15 shrink-0">
                                        {order.productId?.image?.url ? (
                                            <Image
                                                src={order.productId.image.url}
                                                alt={order.productId.name || 'Product'}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#0F3D2E]/40 bg-[#F3F9F5]">
                                                <ShoppingBag size={22} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-mono font-bold text-[#0F3D2E] bg-[#0F3D2E]/5 border border-[#0F3D2E]/20 px-2 py-0.5 rounded">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-[11px] text-[#4B5D53]">
                                                <Calendar size={12} />
                                                {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <h2 className="text-base sm:text-lg font-bold text-[#142B20] truncate group-hover:text-[#1F7A4B] transition-colors">
                                            {order.productId?.name || 'N/A'}
                                        </h2>

                                        <div className="flex items-center gap-2 text-xs text-[#4B5D53]">
                                            <span className="inline-flex items-center gap-1 bg-[#F3F9F5] border border-[#0F3D2E]/15 px-2.5 py-0.5 rounded font-medium">
                                                <Layers size={12} className="text-[#4B7C5E]" />
                                                {order.quantity} {order.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Total, Status & Action */}
                                <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-1/2 border-t md:border-t-0 pt-3 md:pt-0 border-[#0F3D2E]/10">
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] uppercase tracking-widest font-semibold text-[#4B7C5E]">
                                            {t.farmerReceiveOrders.totalAmount}
                                        </p>
                                        <p className="text-lg sm:text-xl font-extrabold text-[#142B20] tracking-tight border-b-2 border-[#1F7A4B]/40 inline-block">
                                            {t.farmerReceiveOrders.currency}{order.totalAmount.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="shrink-0">{getStatusBadge(order.status)}</div>

                                    <div className="w-10 h-10 rounded-full bg-[#F3F9F5] border-2 border-[#0F3D2E]/15 group-hover:bg-[#0F3D2E] group-hover:border-[#0F3D2E] group-hover:text-white text-[#4B5D53] flex items-center justify-center transition-all duration-300 shrink-0">
                                        <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!orderLoading && farmerReceiveOrders?.orders && farmerReceiveOrders.orders.length > 0 &&
                    farmerReceiveOrders.pagination && farmerReceiveOrders.pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-[#0F3D2E]/12 shadow-sm">
                            <p className="text-xs sm:text-sm text-[#4B5D53] font-medium">
                                {t.farmerReceiveOrders.page} <span className="font-bold text-[#142B20]">{farmerReceiveOrders.pagination.currentPage}</span> {t.farmerReceiveOrders.of}{' '}
                                <span className="font-bold text-[#142B20]">{farmerReceiveOrders.pagination.totalPages}</span>
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#142B20] bg-[#F3F9F5] hover:bg-[#E6F4EA] border border-[#0F3D2E]/15 rounded-xl disabled:opacity-40 disabled:hover:bg-[#F3F9F5] disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={16} />
                                    {t.farmerReceiveOrders.previous}
                                </button>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= farmerReceiveOrders.pagination.totalPages}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-[#142B20] bg-[#F3F9F5] hover:bg-[#E6F4EA] border border-[#0F3D2E]/15 rounded-xl disabled:opacity-40 disabled:hover:bg-[#F3F9F5] disabled:cursor-not-allowed transition-all"
                                >
                                    {t.farmerReceiveOrders.next}
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
            </div>
        </div>
    )
}

export default Page