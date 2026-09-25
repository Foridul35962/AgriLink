"use client"

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Search, X, ChevronLeft, ChevronRight, ArrowUpRight, Gavel, PackageX } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { getAratdarBiddingProducts } from '@/store/slice/productSlice'
import { AppDispatch, RootState } from '@/store/store'
import { CATEGORIES_MAP } from '@/constants/constantValues'
import { AratdarBiddingProduct } from '@/types/productTypes'

// ---- time-left helper ----
const getTimeRemaining = (endTime: string) => {
    const total = new Date(endTime).getTime() - Date.now()
    if (total <= 0) return null
    const days = Math.floor(total / (1000 * 60 * 60 * 24))
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
    return { days, hours, minutes }
}

const AratdarBiddingProductsPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const searchParams = useSearchParams()
    const { t, locale } = useLanguage()

    const { productLoading, allBiddingProduct } = useSelector(
        (state: RootState) => state.product
    )

    // URL Query Params Parse
    const pageParam = searchParams.get('page')
    const categoryParam = searchParams.get('category') || ''
    const nameParam = searchParams.get('name') || ''

    const currentPage = pageParam ? parseInt(pageParam, 10) : 1

    // Local Search State
    const [searchTerm, setSearchTerm] = useState(nameParam)

    // Helper to sync query params
    const createQueryString = useCallback(
        (paramsToUpdate: Record<string, string | number | null>) => {
            const params = new URLSearchParams(searchParams.toString())

            Object.entries(paramsToUpdate).forEach(([key, value]) => {
                if (value === null || value === '') {
                    params.delete(key)
                } else {
                    params.set(key, String(value))
                }
            })

            return params.toString()
        },
        [searchParams]
    )

    // Set default URL page=1 if missing
    useEffect(() => {
        if (!pageParam) {
            router.replace(`?${createQueryString({ page: 1 })}`)
        }
    }, [pageParam, router, createQueryString])

    // Fetch data whenever filters or page changes
    useEffect(() => {
        dispatch(
            getAratdarBiddingProducts({
                page: currentPage,
                category: categoryParam || undefined,
                name: nameParam || undefined,
            })
        )
    }, [dispatch, currentPage, categoryParam, nameParam])

    // Keep input in sync with URL param
    useEffect(() => {
        setSearchTerm(nameParam)
    }, [nameParam])

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.push(
            `?${createQueryString({
                category: e.target.value,
                name: searchTerm || null,
                page: 1
            })}`
        )
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`?${createQueryString({ name: searchTerm, page: 1 })}`)
    }

    const handlePageChange = (newPage: number) => {
        router.push(`?${createQueryString({ page: newPage })}`)
    }

    const handleResetFilters = () => {
        setSearchTerm('')
        router.push('?page=1')
    }

    const { data: products = [], pagination } = allBiddingProduct || {}
    const totalPages = pagination?.totalPages || 1

    // Render top-right status badge (active / expired / sold)
    const renderStatusBadge = (product: AratdarBiddingProduct) => {
        if (product.isExpired || product.productStatus === 'expired') {
            return (
                <span className="rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    {t.biddingProduct.expired}
                </span>
            )
        }
        if (product.productStatus === 'sold') {
            return (
                <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {t.biddingProduct.sold}
                </span>
            )
        }
        return (
            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                {t.biddingProduct.active}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">

                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                            {t.biddingProduct.title}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {t.biddingProduct.subtitle}
                        </p>
                    </div>
                    {pagination?.totalProducts ? (
                        <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-800">
                            {pagination.totalProducts} {t.biddingProduct.title}
                        </span>
                    ) : null}
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm md:flex-row">

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 md:w-1/2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t.biddingProduct.searchPlaceholder}
                                className="w-full text-black rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            {t.biddingProduct.searchBtn}
                        </button>
                    </form>

                    {/* Category Filter */}
                    <div className="flex w-full items-center gap-3 md:w-auto">
                        <select
                            value={categoryParam}
                            onChange={handleCategoryChange}
                            className="w-full text-black cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 md:w-56"
                        >
                            <option value="">{t.biddingProduct.allCategories}</option>
                            {CATEGORIES_MAP.map((cat) => (
                                <option key={cat.en} value={cat.en}>
                                    {locale === 'bn' ? cat.bn : cat.en}
                                </option>
                            ))}
                        </select>

                        {(categoryParam || nameParam) && (
                            <button
                                onClick={handleResetFilters}
                                className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                            >
                                <X size={14} />
                                {t.biddingProduct.reset}
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                {productLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm"
                            >
                                <div className="h-44 w-full rounded-xl bg-gray-200" />
                                <div className="h-5 w-3/4 rounded bg-gray-200" />
                                <div className="h-4 w-1/2 rounded bg-gray-200" />
                                <div className="flex justify-between border-t border-gray-100 pt-3">
                                    <div className="h-4 w-20 rounded bg-gray-200" />
                                    <div className="h-4 w-20 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <PackageX size={28} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {t.biddingProduct.noProducts}
                        </h3>
                        <p className="mx-auto max-w-md text-sm text-gray-500">
                            {t.biddingProduct.noProductsDesc}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product, index) => {
                            const categoryObj = CATEGORIES_MAP.find(
                                (c) => c.en.toLowerCase() === product.category.toLowerCase()
                            )
                            const categoryName = locale === 'bn' ? (categoryObj?.bn || product.category) : product.category

                            const isActive = !product.isExpired && product.productStatus !== 'expired' && product.productStatus !== 'sold'
                            const isLeading = product.myBid > 0 && product.myBid >= product.currentHighestBid
                            const isOutbid = product.myBid > 0 && product.myBid < product.currentHighestBid
                            const remaining = isActive ? getTimeRemaining(product.endTime) : null

                            return (
                                <motion.div
                                    key={product.productId}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: index * 0.03 }}
                                >
                                    <Link
                                        href={`/products/${product.productId}`}
                                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <div className="relative h-48 w-full overflow-hidden bg-emerald-50/50">
                                            {product.image?.url ? (
                                                <img
                                                    src={product.image.url}
                                                    alt={product.name}
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-emerald-700">
                                                    N/A
                                                </div>
                                            )}
                                            <div className="absolute right-3 top-3">
                                                {renderStatusBadge(product)}
                                            </div>
                                            {isActive && (
                                                <div
                                                    className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isLeading
                                                        ? 'bg-emerald-600 text-white'
                                                        : isOutbid
                                                            ? 'bg-red-600 text-white'
                                                            : 'hidden'
                                                        }`}
                                                >
                                                    <Gavel size={12} />
                                                    {isLeading ? t.biddingProduct.leading : t.biddingProduct.outbid}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between space-y-4 p-4">
                                            <div>
                                                <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-800">
                                                    {product.name}
                                                </h3>
                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span className="rounded bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
                                                        {categoryName}
                                                    </span>
                                                    <span>
                                                        {product.quantity} {product.unit}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 rounded-xl border border-emerald-50 bg-[#F8FAF9] p-3">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-500">
                                                        {t.biddingProduct.myBid}
                                                    </span>
                                                    <span className="font-semibold text-gray-800">
                                                        ৳{product.myBid}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-200/60 pt-1 text-sm">
                                                    <span className="text-xs font-medium text-emerald-800">
                                                        {t.biddingProduct.highestBid}
                                                    </span>
                                                    <span className="font-bold text-emerald-700">
                                                        ৳{product.currentHighestBid}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 text-xs">
                                                <span className="text-gray-400">
                                                    {remaining
                                                        ? `${t.biddingProduct.timeLeft}: ${remaining.days > 0 ? `${remaining.days}${t.biddingProduct.daysShort} ` : ''}${remaining.hours}${t.biddingProduct.hoursShort} ${remaining.minutes}${t.biddingProduct.minutesShort}`
                                                        : `${t.biddingProduct.ended} ${new Date(product.endTime).toLocaleDateString()}`}
                                                </span>
                                                <ArrowUpRight
                                                    size={16}
                                                    className="text-gray-300 transition group-hover:text-emerald-600"
                                                />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                            {t.biddingProduct.previous}
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            {t.biddingProduct.page} {currentPage} {t.biddingProduct.of} {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {t.biddingProduct.next}
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}

export default AratdarBiddingProductsPage