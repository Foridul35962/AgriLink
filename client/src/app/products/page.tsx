"use client"

import React, { useEffect, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/store/store"
import { getAllProducts } from "@/store/slice/productSlice"
import { useLanguage } from "@/context/LanguageContext"
import { getAllProductsType } from "@/types/productTypes"
import { CATEGORIES_MAP, DISTRICTS, DISTRICTS_BN } from "@/constants/constantValues"
import { Search, MapPin, Tag, RefreshCw, ChevronLeft, ChevronRight, PackageX } from "lucide-react"
import Link from "next/link"

export default function ProductsPage() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const dispatch = useDispatch<AppDispatch>()

    const [, startTransition] = useTransition()
    const { allProducts, productLoading } = useSelector((state: RootState) => state.product)

    // language hook integration
    const { t, locale } = useLanguage()

    // Extract parameters from URL
    const page = searchParams.get("page") || "1"
    const category = searchParams.get("category") || ""
    const district = searchParams.get("district") || ""
    const name = searchParams.get("name") || ""

    // Local state to manage search input before press enter
    const [searchTerm, setSearchTerm] = React.useState(name)

    // Keep local search term in sync with URL name parameter
    React.useEffect(() => {
        setSearchTerm(name)
    }, [name])

    // Ensure default URL state includes 'page=1' if missing
    useEffect(() => {
        if (!searchParams.get("page")) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", "1")
            router.replace(`${pathname}?${params.toString()}`)
        }
    }, [searchParams, pathname, router])

    // Dispatch API action whenever active URL search params change
    useEffect(() => {
        const queryParams: getAllProductsType = {
            page,
            ...(category && { category }),
            ...(district && { district }),
            ...(name && { name }),
        }

        dispatch(getAllProducts(queryParams)).unwrap()
    }, [dispatch, page, category, district, name])

    // Helper function to update search params
    const updateUrlParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // Reset to page 1 whenever filters change (except when changing page itself)
        if (key !== "page") {
            params.set("page", "1")
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`)
        })
    }

    // Trigger URL search on Enter key or button click
    const handleSearchSubmit = () => {
        updateUrlParam("name", searchTerm.trim())
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleSearchSubmit()
        }
    }

    const handleResetFilters = () => {
        setSearchTerm("")
        router.push(`${pathname}?page=1`)
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        🌾 Fresh Harvest Direct
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl tracking-tight">
                        {t.productsPage.title}
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                        {t.productsPage.subtitle}
                    </p>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Search Input */}
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Search className="w-3.5 h-3.5 text-emerald-600" />
                                {t.productsPage.searchPlaceholder}
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t.productsPage.searchPlaceholder}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={handleSearchSubmit}
                                    className="absolute right-2.5 p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                                    title="Search"
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Category Select */}
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                {t.productsPage.categoryLabel}
                            </label>
                            <select
                                value={category}
                                onChange={(e) => updateUrlParam("category", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                            >
                                <option value="">{t.productsPage.allCategories}</option>
                                {CATEGORIES_MAP.map((item) => (
                                    <option key={item.en} value={item.en}>
                                        {locale === "bn" ? item.bn : item.en}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* District Select */}
                        <div className="flex flex-col space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                {t.productsPage.districtLabel}
                            </label>
                            <select
                                value={district}
                                onChange={(e) => updateUrlParam("district", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                            >
                                <option value="">{t.productsPage.allDistricts}</option>
                                {DISTRICTS.map((dist) => (
                                    <option key={dist} value={dist}>
                                        {locale === "bn" ? DISTRICTS_BN[dist] || dist : dist}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reset Filters Option */}
                    {(name || category || district) && (
                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-emerald-50"
                            >
                                <RefreshCw className="w-3 h-3" />
                                {t.productsPage.resetFilters}
                            </button>
                        </div>
                    )}
                </div>

                {/* Product List Grid */}
                {productLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 animate-pulse shadow-sm"
                            >
                                <div className="h-44 w-full bg-slate-200 rounded-xl" />
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                                </div>
                                <div className="h-8 bg-slate-200 rounded-lg pt-2" />
                            </div>
                        ))}
                    </div>
                ) : allProducts?.products?.length ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {allProducts.products.map((product) => (
                                <Link
                                    href={`/products/${product._id}`}
                                    key={product._id}
                                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/50 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Image Container */}
                                        <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                                            <img
                                                src={product.image?.url || "/placeholder.jpg"}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                            <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-800 shadow-sm border border-emerald-100">
                                                {product.category}
                                            </span>
                                        </div>

                                        {/* Card Content */}
                                        <div className="p-5 space-y-2">
                                            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                                <span>{t.productsPage.availableQty}:</span>
                                                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                                                    {product.quantity} {product.unit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                            {t.productsPage.pricePerUnit}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-emerald-600">
                                                ৳{product.pricePerUnit}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400">/{product.unit}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {allProducts.pagination && allProducts.pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-3 pt-6">
                                <button
                                    disabled={allProducts.pagination.currentPage === 1}
                                    onClick={() => updateUrlParam("page", (Number(page) - 1).toString())}
                                    className="inline-flex items-center gap-1 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    {t.productsPage.previous}
                                </button>

                                <div className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    {t.productsPage.pageLabel} {allProducts.pagination.currentPage} / {allProducts.pagination.totalPages}
                                </div>

                                <button
                                    disabled={allProducts.pagination.currentPage === allProducts.pagination.totalPages}
                                    onClick={() => updateUrlParam("page", (Number(page) + 1).toString())}
                                    className="inline-flex items-center gap-1 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-sm"
                                >
                                    {t.productsPage.next}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* Empty State */
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3 max-w-md mx-auto">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <PackageX className="w-6 h-6" />
                        </div>
                        <p className="text-slate-700 font-medium text-sm">
                            {t.productsPage.noProducts}
                        </p>
                        {(name || category || district) && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs font-bold text-emerald-600 hover:underline pt-1"
                            >
                                {t.productsPage.resetFilters}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}