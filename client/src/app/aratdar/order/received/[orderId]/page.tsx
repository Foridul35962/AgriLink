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
    Truck,
    RefreshCw,
    Phone,
    Mail,
    MapPin,
    ShieldCheck
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { aratdarChangeStatus, getAratdarReceiveOrderDetails } from '@/store/slice/orderSlice'
import { AppDispatch, RootState } from '@/store/store'

type StatusType = "PROCESSING" | "SHIPPED" | "DELIVERED"

interface FormInputs {
    status: StatusType
}

const Page = () => {
    const { orderId } = useParams()
    const dispatch = useDispatch<AppDispatch>()
    const { orderLoading, aratdarReceiveOrderDetails } = useSelector((state: RootState) => state.order)
    const { t } = useLanguage()
    const [statusLoading, setStatusLoading] = useState(false)

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormInputs>()

    useEffect(() => {
        const fetch = async () => {
            await dispatch(getAratdarReceiveOrderDetails({ orderId: orderId as string })).unwrap()
        }
        if (aratdarReceiveOrderDetails?._id !== orderId) {
            fetch()
        }
    }, [orderId, dispatch, aratdarReceiveOrderDetails?._id])

    // পরবর্তী সম্ভাব্য স্ট্যাটাস চিহ্নিতকরণ
    const getNextAvailableStatus = (currentStatus?: string): StatusType | "" => {
        switch (currentStatus) {
            case "PENDING":
                return "PROCESSING"
            case "PROCESSING":
                return "SHIPPED"
            case "SHIPPED":
                return "DELIVERED"
            default:
                return ""
        }
    }

    useEffect(() => {
        if (aratdarReceiveOrderDetails?.status) {
            const nextStatus = getNextAvailableStatus(aratdarReceiveOrderDetails.status)
            if (nextStatus) {
                setValue("status", nextStatus)
            }
        }
    }, [aratdarReceiveOrderDetails?.status, setValue])

    const onSubmit = async (data: FormInputs) => {
        const currentStatus = aratdarReceiveOrderDetails?.status

        if (!currentStatus || currentStatus === "CANCELLED" || currentStatus === "DELIVERED") {
            return
        }

        const validTransitions: Record<string, StatusType[]> = {
            PENDING: ["PROCESSING"],
            PROCESSING: ["SHIPPED"],
            SHIPPED: ["DELIVERED"]
        }

        if (!validTransitions[currentStatus]?.includes(data.status)) {
            toast.error(t.aratdarReceiveOrderDetails.invalidTransition)
            return
        }

        try {
            setStatusLoading(true)
            await dispatch(aratdarChangeStatus({ orderId: orderId as string, status: data.status })).unwrap()
            toast.success(t.aratdarReceiveOrderDetails.statusUpdatedSuccess)
        } catch (error: any) {
            toast.error(error?.message || "Failed to update status")
        } finally {
            setStatusLoading(false)
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

    // Skeleton / Loading State
    if (orderLoading) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-sm space-y-4 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-24 bg-gray-100 rounded-xl"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-40 bg-gray-100 rounded-xl"></div>
                            <div className="h-40 bg-gray-100 rounded-xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!aratdarReceiveOrderDetails) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl border border-emerald-100 shadow-sm text-center max-w-md w-full">
                    <AlertCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium text-lg">Order not found</p>
                    <Link
                        href="/aratdar/order/received"
                        className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                    >
                        {t.aratdarReceiveOrderDetails.backToList}
                    </Link>
                </div>
            </div>
        )
    }

    const { status, buyerId, inventoryId, quantity, unit, totalAmount, createdAt, cancelReason } = aratdarReceiveOrderDetails
    const nextStatus = getNextAvailableStatus(status)

    // Status Progress Tracking Steps
    const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]
    const currentStepIndex = steps.indexOf(status)

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8 text-gray-800">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navigation & Action Bar */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/aratdar/order/received"
                        className="inline-flex items-center space-x-2 text-emerald-800 hover:text-emerald-900 font-medium transition-colors text-sm bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-emerald-100 shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t.aratdarReceiveOrderDetails.backToList}</span>
                    </Link>

                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wider uppercase ${getStatusBadge(status)}`}>
                        {status}
                    </span>
                </div>

                {/* Main Header Card */}
                <div className="bg-white rounded-2xl border border-emerald-100/80 p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                {t.aratdarReceiveOrderDetails.title}
                            </span>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-2 font-mono">
                                #{aratdarReceiveOrderDetails._id}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{new Date(createdAt).toLocaleString()}</span>
                            </p>
                        </div>

                        <div className="sm:text-right bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60">
                            <p className="text-xs font-medium text-gray-500">{t.aratdarReceiveOrderDetails.totalAmount}</p>
                            <p className="text-2xl font-black text-emerald-800 mt-0.5">৳{totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Visual Order Status Timeline Progress */}
                    {status !== "CANCELLED" && (
                        <div className="pt-6">
                            <div className="grid grid-cols-4 gap-2 text-center">
                                {steps.map((step, idx) => {
                                    const isCompleted = currentStepIndex >= idx
                                    const isCurrent = currentStepIndex === idx
                                    return (
                                        <div key={step} className="flex flex-col items-center">
                                            <div className="w-full flex items-center justify-center relative mb-2">
                                                {/* Line Connector */}
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
                                                {/* Node Circle */}
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

                {/* Cancel Reason Box */}
                {status === "CANCELLED" && cancelReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start space-x-3 text-rose-800">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                        <div>
                            <p className="font-bold text-sm">{t.aratdarReceiveOrderDetails.cancelReason}</p>
                            <p className="text-sm mt-1 text-rose-700/90 leading-relaxed">{cancelReason}</p>
                        </div>
                    </div>
                )}

                {/* Action Panel: Change Status Form */}
                {nextStatus && status !== "CANCELLED" && status !== "DELIVERED" && (
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-xs">
                        <div className="flex items-center space-x-2 mb-4">
                            <RefreshCw className="w-4 h-4 text-emerald-700" />
                            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                {t.aratdarReceiveOrderDetails.changeStatus}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex-1">
                                <select
                                    {...register("status", {
                                        required: true,
                                        validate: (val) => {
                                            const validTransitions: Record<string, string[]> = {
                                                PENDING: ["PROCESSING"],
                                                PROCESSING: ["SHIPPED"],
                                                SHIPPED: ["DELIVERED"]
                                            }
                                            return validTransitions[status]?.includes(val) || t.aratdarReceiveOrderDetails.invalidTransition
                                        }
                                    })}
                                    className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/20 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition"
                                >
                                    {status === "PENDING" && <option value="PROCESSING">PROCESSING</option>}
                                    {status === "PROCESSING" && <option value="SHIPPED">SHIPPED</option>}
                                    {status === "SHIPPED" && <option value="DELIVERED">DELIVERED</option>}
                                </select>
                                {errors.status && (
                                    <p className="text-xs text-rose-500 font-medium mt-1.5 ml-1">{errors.status.message}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={statusLoading}
                                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition shadow-xs active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {statusLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>{t.aratdarReceiveOrderDetails.updating}</span>
                                    </>
                                ) : (
                                    <span>{t.aratdarReceiveOrderDetails.updateStatus}</span>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Detailed Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Buyer Information Card */}
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 text-emerald-800 pb-3 border-b border-gray-100">
                            <User className="w-5 h-5 text-emerald-700" />
                            <h2 className="font-bold text-gray-900 text-base">{t.aratdarReceiveOrderDetails.buyerDetails}</h2>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500 flex items-center space-x-2">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{t.aratdarReceiveOrderDetails.buyerName}</span>
                                </span>
                                <span className="font-semibold text-gray-800">{buyerId?.name || 'N/A'}</span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500 flex items-center space-x-2">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{t.aratdarReceiveOrderDetails.phone}</span>
                                </span>
                                <span className="font-semibold text-gray-800">{buyerId?.phoneNumber || 'N/A'}</span>
                            </div>

                            {buyerId?.email && (
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-gray-500 flex items-center space-x-2">
                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{t.aratdarReceiveOrderDetails.email}</span>
                                    </span>
                                    <span className="font-medium text-gray-800">{buyerId.email}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500 flex items-center space-x-2">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{t.aratdarReceiveOrderDetails.district}</span>
                                </span>
                                <span className="font-semibold text-gray-800">{buyerId?.district || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Information Card */}
                    <div className="bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 text-emerald-800 pb-3 border-b border-gray-100">
                            <Package className="w-5 h-5 text-emerald-700" />
                            <h2 className="font-bold text-gray-900 text-base">{t.aratdarReceiveOrderDetails.productDetails}</h2>
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
                                <span className="text-gray-500">{t.aratdarReceiveOrderDetails.quantity}</span>
                                <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                                    {quantity} {unit}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-1">
                                <span className="text-gray-500">{t.aratdarReceiveOrderDetails.totalAmount}</span>
                                <span className="font-bold text-emerald-700 text-base">৳{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default Page