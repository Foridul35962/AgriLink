"use client"

import { useLanguage } from '@/context/LanguageContext'
import { createInventoryOrder, deleteInventory, getInventoryDetails } from '@/store/slice/inventorySlice'
import { AppDispatch, RootState } from '@/store/store'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useForm } from 'react-hook-form'
import {
    ArrowLeft,
    Wheat,
    Boxes,
    PackageCheck,
    BadgeDollarSign,
    FileText,
    ShoppingCart,
    Pencil,
    Trash2,
    X,
    Loader2,
    PackageX,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
} from 'lucide-react'

interface OrderFormData {
    quantity: number
}

const page = () => {
    const { inventoryId } = useParams()
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()
    const { inventoryLoading, inventoryDetails } = useSelector((state: RootState) => state.inventory)
    const { user } = useSelector((state: RootState) => state.auth)
    const { t } = useLanguage()

    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isOrderSubmitted, setIsOrderSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        reset: resetOrderForm,
        formState: { errors: orderErrors, isSubmitting: isOrdering },
    } = useForm<OrderFormData>({
        defaultValues: {
            quantity: 1,
        },
    })

    useEffect(() => {
        const fetch = async () => {
            await dispatch(getInventoryDetails({ inventoryId: inventoryId as string })).unwrap()
        }
        if (inventoryDetails?._id !== inventoryId) {
            fetch()
        }
    }, [inventoryId])

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await dispatch(deleteInventory({ inventoryId: inventoryId as string })).unwrap()
            toast.success(t.inventoryDetails.deleteModal.successMessage)
            setShowDeleteModal(false)
            router.push('/aratdar/inventory')
        } catch (error: any) {
            toast.error(error?.message || t.inventoryDetails.deleteModal.errorMessage)
        } finally {
            setIsDeleting(false)
        }
    }

    const isOwner = user?._id && inventoryDetails?.aratdarId && user._id === inventoryDetails.aratdarId
    const isRetailer = user?.role === 'retailer'
    const availableQuantity = inventoryDetails
        ? inventoryDetails.totalQuantity - inventoryDetails.allocatedQuantity
        : 0

    const isAvailable = inventoryDetails?.status === 'available' && availableQuantity > 0

    const handleCloseOrderModal = () => {
        setShowOrderModal(false)
        setIsOrderSubmitted(false)
        resetOrderForm()
    }

    const handleOrderSubmit = async (data: OrderFormData,e: React.BaseSyntheticEvent) => {
        e.preventDefault()
        try {
            const res = await dispatch(createInventoryOrder({ inventoryId: inventoryId as string, quantity: data.quantity })).unwrap()

            setIsOrderSubmitted(true)
            toast.success(t.inventoryDetails.orderModal?.successMessage || "Order placed successfully!")
            setTimeout(() => {
                handleCloseOrderModal()
                router.push(`/retailer/order/${res.data._id}`)
            }, 2000)
        } catch (error: any) {
            toast.error(error?.message || "Failed to place order")
        }
    }

    // Loading skeleton
    if (inventoryLoading && inventoryDetails?._id !== inventoryId) {
        return (
            <div className="min-h-screen bg-[#F5F8F5] py-10 px-4">
                <div className="max-w-4xl mx-auto animate-pulse">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
                    <div className="bg-white rounded-2xl border border-green-100/80 p-6 space-y-4">
                        <div className="w-full h-64 bg-gray-200 rounded-xl" />
                        <div className="h-6 w-1/2 bg-gray-200 rounded" />
                        <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        )
    }

    // Not found state
    if (!inventoryLoading && !inventoryDetails) {
        return (
            <div className="min-h-screen bg-[#F5F8F5] py-10 px-4">
                <div className="max-w-4xl mx-auto text-center py-20">
                    <PackageX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h2 className="text-lg font-semibold text-gray-800">
                        {t.inventoryDetails.notFoundTitle}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t.inventoryDetails.notFoundMessage}</p>
                </div>
            </div>
        )
    }

    if (!inventoryDetails) return null

    return (
        <div className="min-h-screen bg-[#F5F8F5] py-10 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back link */}
                <Link
                    href="/aratdar/inventory"
                    className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-700 transition mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t.inventoryDetails.backButton}
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-green-100/80 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image */}
                        <div className="bg-green-50 flex items-center justify-center p-6">
                            {inventoryDetails.image?.url ? (
                                <img
                                    src={inventoryDetails.image.url}
                                    alt={inventoryDetails.productName}
                                    className="w-full h-72 object-cover rounded-xl border border-green-100"
                                />
                            ) : (
                                <div className="w-full h-72 flex items-center justify-center rounded-xl border border-dashed border-green-200">
                                    <Wheat className="w-10 h-10 text-green-300" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="p-6 flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                                    {inventoryDetails.category}
                                </span>
                                <span
                                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${inventoryDetails.status === 'available'
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : 'bg-red-50 text-red-600 border-red-100'
                                        }`}
                                >
                                    {inventoryDetails.status === 'available'
                                        ? t.inventoryDetails.status.available
                                        : t.inventoryDetails.status.depleted}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                {inventoryDetails.productName}
                            </h1>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-[#F5F8F5] rounded-xl p-3 border border-green-100/60">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <Boxes className="w-3.5 h-3.5" />
                                        {t.inventoryDetails.totalQuantityCard}
                                    </div>
                                    <p className="text-base font-semibold text-gray-900">
                                        {inventoryDetails.totalQuantity} {inventoryDetails.unit}
                                    </p>
                                </div>

                                <div className="bg-[#F5F8F5] rounded-xl p-3 border border-green-100/60">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <PackageCheck className="w-3.5 h-3.5" />
                                        {t.inventoryDetails.availableQuantityCard}
                                    </div>
                                    <p className="text-base font-semibold text-green-700">
                                        {availableQuantity} {inventoryDetails.unit}
                                    </p>
                                </div>

                                {isOwner &&
                                    <div className="bg-[#F5F8F5] rounded-xl p-3 border border-green-100/60">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                            <Boxes className="w-3.5 h-3.5" />
                                            {t.inventoryDetails.allocatedQuantityCard}
                                        </div>
                                        <p className="text-base font-semibold text-gray-900">
                                            {inventoryDetails.allocatedQuantity} {inventoryDetails.unit}
                                        </p>
                                    </div>
                                }

                                <div className="bg-[#F5F8F5] rounded-xl p-3 border border-green-100/60">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                                        <BadgeDollarSign className="w-3.5 h-3.5" />
                                        {t.inventoryDetails.pricePerUnitCard}
                                    </div>
                                    <p className="text-base font-semibold text-gray-900">
                                        ৳{inventoryDetails.pricePerUnit}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-auto flex flex-wrap gap-3">
                                {isRetailer && (
                                    <button
                                        onClick={() => setShowOrderModal(true)}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-green-600/20 transition"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        {t.inventoryDetails.orderButton}
                                    </button>
                                )}

                                {isOwner && (
                                    <>
                                        <Link
                                            href={`/aratdar/inventory/edit/${inventoryDetails._id}`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-200 transition"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            {t.inventoryDetails.editButton}
                                        </Link>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-200 transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t.inventoryDetails.deleteButton}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="border-t border-green-100/80 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                {t.inventoryDetails.descriptionTitle}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {inventoryDetails.description || t.inventoryDetails.noDescription}
                        </p>
                    </div>
                </div>
            </div>

            {/* Order Modal */}
            {showOrderModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
                        <button
                            onClick={handleCloseOrderModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingCart className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {t.inventoryDetails.orderModal?.title || "Place an Order"}
                            </h3>
                        </div>

                        {!isAvailable ? (
                            /* Stock Out Alert */
                            <div className="space-y-5">
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                                    <p className="text-sm">
                                        {t.inventoryDetails.orderModal?.outOfStockMessage || "Sorry, this item is out of stock or unavailable for order."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCloseOrderModal}
                                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
                                >
                                    {t.inventoryDetails.orderModal?.closeButton || "Close"}
                                </button>
                            </div>
                        ) : isOrderSubmitted ? (
                            /* Success State */
                            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 my-2">
                                <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
                                <p className="text-sm font-medium">
                                    {t.inventoryDetails.orderModal?.successMessage || "Order placed successfully!"}
                                </p>
                            </div>
                        ) : (
                            /* Order Form */
                            <form onSubmit={(e) => handleSubmit((data) => handleOrderSubmit(data, e))(e)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        {t.inventoryDetails.orderModal?.quantityLabel || "Quantity"} ({inventoryDetails.unit})
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={availableQuantity}
                                        {...register("quantity", {
                                            required: t.inventoryDetails.orderModal?.quantityRequiredError || "Please enter quantity",
                                            min: {
                                                value: 1,
                                                message: t.inventoryDetails.orderModal?.quantityMinError || "Quantity must be at least 1",
                                            },
                                            max: {
                                                value: availableQuantity,
                                                message: t.inventoryDetails.orderModal?.quantityMaxError || `Cannot exceed available stock (${availableQuantity} ${inventoryDetails.unit})`,
                                            },
                                            valueAsNumber: true,
                                        })}
                                        className={`w-full px-3.5 text-black py-2.5 border rounded-xl text-sm focus:outline-none transition ${orderErrors.quantity
                                                ? "border-red-500 focus:ring-1 focus:ring-red-500"
                                                : "border-gray-300 focus:border-green-600 focus:ring-1 focus:ring-green-600"
                                            }`}
                                    />
                                    {orderErrors.quantity && (
                                        <p className="text-xs text-red-500 mt-1.5">
                                            {orderErrors.quantity.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseOrderModal}
                                        className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
                                    >
                                        {t.inventoryDetails.orderModal?.closeButton || "Close"}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isOrdering}
                                        className="w-1/2 inline-flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
                                    >
                                        {isOrdering && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {t.inventoryDetails.orderModal?.submitButton || "Confirm Order"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6">
                        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                            {t.inventoryDetails.deleteModal.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">{t.inventoryDetails.deleteModal.message}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl border border-gray-200 transition disabled:opacity-50"
                            >
                                {t.inventoryDetails.deleteModal.cancelButton}
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isDeleting ? t.inventoryDetails.deleteModal.deleting : t.inventoryDetails.deleteModal.confirmButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default page