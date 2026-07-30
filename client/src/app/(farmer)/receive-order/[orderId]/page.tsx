'use client'

import { changeFarmerOrderStatus, getFarmerReceiveOrderDetails } from '@/store/slice/orderSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'
import { useDispatch, useSelector } from 'react-redux'
import {
    ArrowLeft,
    Package,
    Calendar,
    Layers,
    User,
    Phone,
    Mail,
    MapPin,
    Tag,
    ShoppingBag,
    BookOpen,
    Clock,
    CheckCircle2,
    RefreshCw,
    XCircle,
    CircleDot,
    Truck,
    Edit3,
    Loader2
} from 'lucide-react'

const Page = () => {
    const { orderId } = useParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useLanguage()
    const { orderLoading, farmerReceivesOrderDetails } = useSelector((state: RootState) => state.order)

    type FarmerReceiveOrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
    type FarmerOrderUpdateStatus = 'PROCESSING' | 'SHIPPED' | 'DELIVERED'

    const [selectedStatus, setSelectedStatus] = useState<FarmerReceiveOrderStatus | ''>('')
    const [isUpdating, setIsUpdating] = useState<boolean>(false)

    useEffect(() => {
        const fetchDetails = async () => {
            await dispatch(getFarmerReceiveOrderDetails({ orderId: orderId as string })).unwrap()
        }
        if (orderId && orderId !== farmerReceivesOrderDetails?._id) {
            fetchDetails()
        }
    }, [dispatch, orderId, farmerReceivesOrderDetails?._id])

    useEffect(() => {
        if (farmerReceivesOrderDetails?.status) {
            setSelectedStatus(farmerReceivesOrderDetails.status)
        }
    }, [farmerReceivesOrderDetails?.status])

    // Handle status update change
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as FarmerOrderUpdateStatus
        setSelectedStatus(newStatus)
        if (!orderId) return

        try {
            setIsUpdating(true)
            // Dispatch your status update action here
            await dispatch(
                changeFarmerOrderStatus({
                    orderId: orderId as string,
                    status: newStatus,
                })
            ).unwrap()
        } catch (error) {
            if (farmerReceivesOrderDetails?.status) {
                setSelectedStatus(farmerReceivesOrderDetails.status)
            }
        } finally {
            setIsUpdating(false)
        }
    }

    // Status Badge Helper
    const getStatusBadge = (status: string) => {
        const stampStyles: Record<string, { text: string; border: string; bg: string; icon: React.ElementType }> = {
            PENDING: {
                text: 'text-[#D97706]',
                border: 'border-[#F59E0B]',
                bg: 'bg-[#FEF3C7]',
                icon: Clock
            },
            CONFIRMED: {
                text: 'text-[#0D9488]',
                border: 'border-[#14B8A6]',
                bg: 'bg-[#CCFBF1]',
                icon: CircleDot
            },
            PROCESSING: {
                text: 'text-[#0284C7]',
                border: 'border-[#38BDF8]',
                bg: 'bg-[#E0F2FE]',
                icon: RefreshCw
            },
            SHIPPED: {
                text: 'text-[#4F46E5]',
                border: 'border-[#6366F1]',
                bg: 'bg-[#EEF2FF]',
                icon: Truck
            },
            DELIVERED: {
                text: 'text-[#15803D]',
                border: 'border-[#22C55E]',
                bg: 'bg-[#DCFCE7]',
                icon: CheckCircle2
            },
            CANCELLED: {
                text: 'text-[#DC2626]',
                border: 'border-[#EF4444]',
                bg: 'bg-[#FEE2E2]',
                icon: XCircle
            },
        }
        const config = stampStyles[status] || { text: 'text-[#4B5D53]', border: 'border-[#4B5D53]/40', bg: 'bg-[#4B5D53]/5', icon: CircleDot }
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 border-double ${config.border} ${config.text} ${config.bg} text-[11px] font-bold uppercase tracking-widest -rotate-3 shadow-sm select-none`}>
                <Icon size={12} strokeWidth={2.5} />
                {status}
            </span>
        )
    }

    // A single label/value ledger row
    const LedgerRow = ({
        icon: Icon,
        label,
        value,
    }: {
        icon: React.ElementType
        label: string
        value: React.ReactNode
    }) => (
        <div className="flex items-center justify-between gap-4 py-3.5 border-b border-dashed border-[#0F3D2E]/12 last:border-b-0">
            <span className="flex items-center gap-2 text-xs sm:text-sm text-[#4B5D53] font-medium">
                <Icon size={15} className="text-[#4B7C5E] shrink-0" />
                {label}
            </span>
            <span className="text-sm sm:text-base font-bold text-[#142B20] text-right">
                {value}
            </span>
        </div>
    )

    return (
        <div
            className="min-h-screen bg-[#F3F9F5] py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased"
            style={{
                backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(15,61,46,0.05) 0px, rgba(15,61,46,0.05) 1px, transparent 1px, transparent 34px)',
            }}
        >
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Back navigation */}
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D2E] hover:text-[#1F7A4B] transition-colors"
                >
                    <span className="w-8 h-8 rounded-full bg-white border border-[#0F3D2E]/15 flex items-center justify-center shadow-sm">
                        <ArrowLeft size={16} />
                    </span>
                    {t.farmerReceiveOrderDetails.back}
                </button>

                {orderLoading ? (
                    /* Skeleton Loading UI */
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border-2 border-dashed border-[#0F3D2E]/15 p-8 animate-pulse h-40" />
                        <div className="bg-white rounded-2xl border-2 border-dashed border-[#0F3D2E]/15 p-8 animate-pulse h-64" />
                    </div>
                ) : !farmerReceivesOrderDetails ? (
                    /* Not found */
                    <div className="bg-white rounded-2xl border-2 border-dashed border-[#0F3D2E]/20 p-12 sm:p-16 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-[#0F3D2E]/8 text-[#0F3D2E] rounded-2xl flex items-center justify-center mb-5 border border-[#0F3D2E]/15">
                            <Package size={36} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-[#142B20] mb-2">
                            {t.farmerReceiveOrderDetails.notFound}
                        </h3>
                        <p className="text-[#4B5D53] text-sm max-w-md leading-relaxed">
                            {t.farmerReceiveOrderDetails.notFoundSub}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Ledger Cover Header */}
                        <div className="relative overflow-hidden bg-[#0F3D2E] rounded-2xl border border-[#0B2E22] shadow-xl shadow-[#0B2E22]/20">
                            <div className="absolute left-0 top-0 bottom-0 w-3 border-r-2 border-dashed border-white/25" />
                            <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10 pl-8 pr-6 py-7 sm:pl-12 sm:pr-10 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                <div className="space-y-2.5">
                                    <div className="inline-flex items-center gap-2 text-white/80 text-xs font-bold tracking-[0.2em] uppercase">
                                        <BookOpen size={14} />
                                        <span>{t.farmerReceiveOrderDetails.title}</span>
                                    </div>
                                    <p className="text-lg sm:text-xl font-mono font-bold text-white tracking-wide">
                                        #{farmerReceivesOrderDetails._id.slice(-8).toUpperCase()}
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-xs text-white/70">
                                        <Calendar size={12} />
                                        {new Date(farmerReceivesOrderDetails.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div>{getStatusBadge(farmerReceivesOrderDetails.status)}</div>
                            </div>
                        </div>

                        {/* Status Update Card */}
                        <div className="bg-white rounded-2xl border border-[#0F3D2E]/12 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#0F3D2E]/8 rounded-xl text-[#0F3D2E]">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#142B20]">
                                        {t.farmerReceiveOrderDetails.updateStatus}
                                    </h3>
                                    <p className="text-xs text-[#4B5D53]">
                                        {isUpdating ? t.farmerReceiveOrderDetails.updatingStatus : t.farmerReceiveOrderDetails.statusUpdatedSuccess}
                                    </p>
                                </div>
                            </div>

                            <div className="relative w-full sm:w-auto">
                                <select
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                    disabled={isUpdating}
                                    className="w-full sm:w-56 px-4 py-2.5 bg-[#F3F9F5] border-2 border-[#0F3D2E]/20 rounded-xl text-xs sm:text-sm font-bold text-[#142B20] focus:outline-none focus:border-[#1F7A4B] transition-colors cursor-pointer disabled:opacity-50 appearance-none pr-8"
                                >
                                    {/* যদি বর্তমান status আমাদের ৩টি option-এর বাইরে থাকে (যেমন: PENDING বা CANCELLED), তবে সেটি disabled অপশন হিসেবে দেখাবে */}
                                    {!['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(selectedStatus) && (
                                        <option value={selectedStatus} disabled>
                                            {selectedStatus}
                                        </option>
                                    )}

                                    {/* শুধু এই ৩টি স্ট্যাটাসেই পরিবর্তন করা যাবে */}
                                    <option value="PROCESSING">
                                        {t.farmerReceiveOrderDetails.statusOptions.PROCESSING}
                                    </option>
                                    <option value="SHIPPED">
                                        {t.farmerReceiveOrderDetails.statusOptions.SHIPPED}
                                    </option>
                                    <option value="DELIVERED">
                                        {t.farmerReceiveOrderDetails.statusOptions.DELIVERED}
                                    </option>
                                </select>

                                {/* Loading Spinner */}
                                {isUpdating && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 size={16} className="animate-spin text-[#0F3D2E]" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Card */}
                        <div className="bg-white rounded-2xl border border-[#0F3D2E]/12 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                            <div className="relative w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden bg-[#F3F9F5] border-2 border-[#0F3D2E]/15 shrink-0">
                                {farmerReceivesOrderDetails.productId?.image?.url ? (
                                    <Image
                                        src={farmerReceivesOrderDetails.productId.image.url}
                                        alt={farmerReceivesOrderDetails.productId.name || 'Product'}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#0F3D2E]/40">
                                        <ShoppingBag size={26} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 min-w-0">
                                <h1 className="text-xl sm:text-2xl font-extrabold text-[#142B20] truncate">
                                    {farmerReceivesOrderDetails.productId?.name || 'N/A'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 bg-[#F3F9F5] border border-[#0F3D2E]/15 px-2.5 py-1 rounded-md text-xs font-medium text-[#4B5D53]">
                                        <Tag size={12} className="text-[#4B7C5E]" />
                                        {farmerReceivesOrderDetails.productId?.category || 'N/A'}
                                    </span>
                                    {farmerReceivesOrderDetails.buyerId?.district && (
                                        <span className="inline-flex items-center gap-1.5 bg-[#F3F9F5] border border-[#0F3D2E]/15 px-2.5 py-1 rounded-md text-xs font-medium text-[#4B5D53]">
                                            <MapPin size={12} className="text-[#4B7C5E]" />
                                            {farmerReceivesOrderDetails.buyerId.district}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Info Ledger */}
                        <div className="bg-white rounded-2xl border border-[#0F3D2E]/12 shadow-sm p-5 sm:p-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B7C5E] mb-1">
                                {t.farmerReceiveOrderDetails.orderInfo}
                            </h2>
                            <LedgerRow
                                icon={Layers}
                                label={t.farmerReceiveOrderDetails.quantity}
                                value={`${farmerReceivesOrderDetails.quantity} ${farmerReceivesOrderDetails.unit}`}
                            />
                            <LedgerRow
                                icon={BookOpen}
                                label={t.farmerReceiveOrderDetails.totalAmount}
                                value={
                                    <span className="border-b-2 border-[#1F7A4B]/40">
                                        {t.farmerReceiveOrderDetails.currency}{farmerReceivesOrderDetails.totalAmount.toLocaleString()}
                                    </span>
                                }
                            />
                        </div>

                        {/* Buyer Info Ledger */}
                        <div className="bg-white rounded-2xl border border-[#0F3D2E]/12 shadow-sm p-5 sm:p-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#4B7C5E] mb-1">
                                {t.farmerReceiveOrderDetails.buyerInfo}
                            </h2>
                            <LedgerRow
                                icon={User}
                                label={t.farmerReceiveOrderDetails.buyerName}
                                value={farmerReceivesOrderDetails.buyerId?.name || t.farmerReceiveOrderDetails.notProvided}
                            />
                            <LedgerRow
                                icon={Phone}
                                label={t.farmerReceiveOrderDetails.phoneNumber}
                                value={farmerReceivesOrderDetails.buyerId?.phoneNumber || t.farmerReceiveOrderDetails.notProvided}
                            />
                            <LedgerRow
                                icon={Mail}
                                label={t.farmerReceiveOrderDetails.email}
                                value={farmerReceivesOrderDetails.buyerId?.email || t.farmerReceiveOrderDetails.notProvided}
                            />
                            <LedgerRow
                                icon={MapPin}
                                label={t.farmerReceiveOrderDetails.district}
                                value={farmerReceivesOrderDetails.buyerId?.district || t.farmerReceiveOrderDetails.notProvided}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Page