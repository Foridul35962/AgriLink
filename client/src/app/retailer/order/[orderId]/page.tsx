"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
    ArrowLeft,
    User,
    Package,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Phone,
    Mail,
    X,
    Loader2
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { cancelRetailerOrder, getRetailerPlacedOrderDetails } from '@/store/slice/orderSlice'
import { AppDispatch, RootState } from '@/store/store'

interface CancelFormInputs {
    cancelReason: string
}

const Page = () => {
    const { orderId } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { retailerPlaceOrderDetials, orderLoading } = useSelector((state: RootState) => state.order)
    const { t } = useLanguage()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [cancelling, setCancelling] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CancelFormInputs>()

    useEffect(() => {
        if (orderId && retailerPlaceOrderDetials?._id !== orderId) {
            dispatch(getRetailerPlacedOrderDetails({ orderId: orderId as string }))
        }
    }, [dispatch, orderId, retailerPlaceOrderDetials?._id])

    const handleCancelOrder = async (data: CancelFormInputs) => {
        if (!orderId || !retailerPlaceOrderDetials) return;

        if (retailerPlaceOrderDetials.status !== "PENDING") {
            toast.error(t.retailerOrderDetails.orderNotCancelable)
            return;
        }

        try {
            setCancelling(true)
            await dispatch(cancelRetailerOrder({
                orderId: orderId as string,
                productId: retailerPlaceOrderDetials.inventoryId._id,
                cancelReason: data.cancelReason
            })).unwrap()

            toast.success(t.retailerOrderDetails.cancelledSuccess)
            setIsModalOpen(false)
            reset()
        } catch (error: any) {
            toast.error(error?.message || "Failed to cancel order")
        } finally {
            setCancelling(false)
        }
    }

    // Helper Badge Color Function
    const getStatusBadge = (statusStr: string) => {
        switch (statusStr) {
            case "PENDING":
                return "bg-amber-50 text-amber-700 border-amber-200"
            case "PROCESSING":
                return "bg-blue-50 text-blue-700 border-blue-200"
            case "SHIPPED":
                return "bg-indigo-50 text-indigo-700 border-indigo-200"
            case "DELIVERED":
                return "bg-emerald-50 text-emerald-700 border-emerald-200"
            case "CANCELLED":
                return "bg-rose-50 text-rose-700 border-rose-200"
            default:
                return "bg-gray-50 text-gray-700 border-gray-200"
        }
    }

    // Skeleton Loader for initial state
    if (orderLoading && !retailerPlaceOrderDetials?._id) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-xs space-y-4 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-20 bg-gray-100 rounded-xl"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-40 bg-gray-100 rounded-xl"></div>
                            <div className="h-40 bg-gray-100 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!retailerPlaceOrderDetials) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-xs text-center max-w-md w-full">
                    <AlertCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium text-lg">Order not found</p>
                    <Link
                        href="/retailer/order"
                        className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                    >
                        {t.retailerOrderDetails.backToList}
                    </Link>
                </div>
            </div>
        )
    }

    const { status, sellerId, inventoryId, quantity, unit, totalAmount, createdAt, cancelReason } = retailerPlaceOrderDetials
    const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
    const currentStepIndex = steps.indexOf(status)

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8 text-gray-800">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navigation & Status Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/retailer/order"
                        className="inline-flex items-center space-x-2 text-emerald-800 hover:text-emerald-900 font-medium transition-colors text-sm bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-emerald-100 shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t.retailerOrderDetails.backToList}</span>
                    </Link>

                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wider uppercase ${getStatusBadge(status)}`}>
                        {status}
                    </span>
                </div>

                {/* Header Summary Card */}
                <div className="bg-white rounded-2xl border border-emerald-100/80 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                {t.retailerOrderDetails.orderTitle}
                            </span>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2 font-mono">
                                #{retailerPlaceOrderDetials._id}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(createdAt).toLocaleString()}</span>
                            </p>
                        </div>

                        <div className="flex flex-col sm:items-end justify-between gap-3">
                            <div className="sm:text-right bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/60">
                                <p className="text-xs font-medium text-gray-500">{t.retailerOrderDetails.totalAmount}</p>
                                <p className="text-2xl font-black text-emerald-800 mt-0.5">৳{totalAmount?.toLocaleString()}</p>
                            </div>

                            {/* Cancel Button - Available ONLY in PENDING Status */}
                            {status === "PENDING" && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition active:scale-[0.98]"
                                >
                                    <XCircle className="w-4 h-4" />
                                    <span>{t.retailerOrderDetails.cancelOrder}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Timeline Progress */}
                    {status !== "CANCELLED" && (
                        <div className="pt-6">
                            <div className="grid grid-cols-4 gap-2 text-center">
                                {steps.map((step, idx) => {
                                    const isCompleted = currentStepIndex >= idx
                                    const isCurrent = currentStepIndex === idx
                                    return (
                                        <div key={step} className="flex flex-col items-center">
                                            <div className="w-full flex items-center justify-center relative mb-2">
                                                {idx !== 0 && (
                                                    <div
                                                        className={`absolute left-0 right-1/2 h-1 -translate-y-1/2 top-1/2 z-0 ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                                                            }`}
                                                    />
                                                )}
                                                {idx !== steps.length - 1 && (
                                                    <div
                                                        className={`absolute left-1/2 right-0 h-1 -translate-y-1/2 top-1/2 z-0 ${currentStepIndex > idx ? 'bg-emerald-500' : 'bg-gray-200'
                                                            }`}
                                                    />
                                                )}
                                                <div
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${isCompleted
                                                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                                            : 'bg-gray-100 text-gray-400 border border-gray-300'
                                                        }`}
                                                >
                                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                                </div>
                                            </div>
                                            <span className={`text-[10px] sm:text-xs font-semibold ${isCurrent ? 'text-emerald-800' : 'text-gray-400'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Cancel Reason Display */}
                {status === "CANCELLED" && cancelReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start space-x-3 text-rose-800">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                            <p className="font-bold text-sm">{t.retailerOrderDetails.cancelReasonLabel}</p>
                            <p className="text-sm mt-1 text-rose-700/90 leading-relaxed">{cancelReason}</p>
                        </div>
                    </div>
                )}

                {/* Detailed Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Seller Details */}
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 text-emerald-800 pb-3 border-b border-gray-100">
                            <User className="w-5 h-5 text-emerald-700" />
                            <h2 className="font-bold text-gray-900 text-base">{t.retailerOrderDetails.sellerDetails}</h2>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500 flex items-center space-x-2">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{t.retailerOrderDetails.sellerName}</span>
                                </span>
                                <span className="font-semibold text-gray-800">{sellerId?.name || 'N/A'}</span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500 flex items-center space-x-2">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{t.retailerOrderDetails.phone}</span>
                                </span>
                                <span className="font-semibold text-gray-800">{sellerId?.phoneNumber || 'N/A'}</span>
                            </div>

                            {sellerId?.email && (
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-500 flex items-center space-x-2">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{t.retailerOrderDetails.email}</span>
                                    </span>
                                    <span className="font-medium text-gray-800">{sellerId.email}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 text-emerald-800 pb-3 border-b border-gray-100">
                            <Package className="w-5 h-5 text-emerald-700" />
                            <h2 className="font-bold text-gray-900 text-base">{t.retailerOrderDetails.productDetails}</h2>
                        </div>

                        <div className="flex items-center space-x-4 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/50">
                            {inventoryId?.image?.url ? (
                                <Image
                                    src={inventoryId.image.url}
                                    alt={inventoryId.productName}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-lg object-cover border border-emerald-200/80 shadow-2xs"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-800 font-bold text-xs">
                                    N/A
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">{inventoryId?.productName}</h3>
                                <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 rounded mt-1">
                                    {inventoryId?.category}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm pt-1">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500">{t.retailerOrderDetails.quantity}</span>
                                <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                                    {quantity} {unit}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500">{t.retailerOrderDetails.totalAmount}</span>
                                <span className="font-bold text-emerald-700 text-base">৳{totalAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Cancellation Reason Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-emerald-100 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center space-x-2 text-rose-600 mb-2">
                            <AlertCircle className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900">
                                {t.retailerOrderDetails.cancelReasonTitle}
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit(handleCancelOrder)} className="mt-4 space-y-4">
                            <div>
                                <textarea
                                    {...register("cancelReason", {
                                        required: t.retailerOrderDetails.cancelReasonRequired,
                                        minLength: { value: 5, message: "Minimum 5 characters required" }
                                    })}
                                    rows={4}
                                    placeholder={t.retailerOrderDetails.cancelReasonPlaceholder}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm text-gray-800 transition"
                                />
                                {errors.cancelReason && (
                                    <p className="text-xs text-rose-500 font-medium mt-1">
                                        {errors.cancelReason.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    {t.retailerOrderDetails.close}
                                </button>
                                <button
                                    type="submit"
                                    disabled={cancelling}
                                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>{t.retailerOrderDetails.cancelling}</span>
                                        </>
                                    ) : (
                                        <span>{t.retailerOrderDetails.confirmCancel}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Page