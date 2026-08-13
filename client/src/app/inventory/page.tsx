"use client"

import React, { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, ArrowUpRight } from 'lucide-react'

import { useLanguage } from '@/context/LanguageContext'
import { getAllInventory } from '@/store/slice/inventorySlice'
import { AppDispatch, RootState } from '@/store/store'
import { CATEGORIES_MAP } from '@/constants/constantValues'

export default function InventoryPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const searchParams = useSearchParams()

  const { locale, t } = useLanguage() // expects 'locale' to be 'en' | 'bn'
  const { allInventories, inventoryLoading } = useSelector((state: RootState) => state.inventory)

  // URL state sync
  const currentPage = Number(searchParams.get('page')) || 1
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || ''

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)

  // URL Query Update helper
  const updateQueryParams = useCallback(
    (params: { page?: number; search?: string; category?: string }) => {
      const newParams = new URLSearchParams(searchParams.toString())

      if (params.page !== undefined) newParams.set('page', params.page.toString())
      if (params.search !== undefined) {
        if (params.search) newParams.set('search', params.search)
        else newParams.delete('search')
      }
      if (params.category !== undefined) {
        if (params.category) newParams.set('category', params.category)
        else newParams.delete('category')
      }

      router.push(`?${newParams.toString()}`)
    },
    [router, searchParams]
  )

  // Ensure 'page=1' is always in the URL on initial mount if missing
  useEffect(() => {
    if (!searchParams.has('page')) {
      updateQueryParams({ page: 1 })
    }
  }, [searchParams, updateQueryParams])

  // Fetch Inventory when URL params change
  useEffect(() => {
    dispatch(
      getAllInventory({
        page: currentPage,
        productName: initialSearch || undefined,
        category: (initialCategory as any) || undefined,
      })
    )
  }, [dispatch, currentPage, initialSearch, initialCategory])

  // Search Execute function (Button Click & Enter Key)
  const handleSearchExecute = () => {
    updateQueryParams({ search: searchTerm.trim(), page: 1 })
  }

  // Handle Enter Key press inside Input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchExecute()
    }
  }

  // Category change handler (Select korlei immediately fetch hobe)
  const handleCategoryChange = (catEn: string) => {
    setSelectedCategory(catEn)
    updateQueryParams({ category: catEn, page: 1 })
  }

  // Pagination Handler
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (allInventories?.pagination?.totalPages || 1)) {
      updateQueryParams({ page: newPage })
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F8F5] text-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-emerald-100/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950 tracking-tight">
                {t.allInventory.title}
              </h1>
              <p className="text-slate-500 mt-1 text-sm sm:text-base">
                {t.allInventory.subtitle}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            {/* Search Box with Integrated Button */}
            <div className="relative flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 h-5 w-5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t.allInventory.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-4 py-3 bg-[#F5F8F5] border border-emerald-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm"
                />
              </div>

              {/* Explicit Search Button */}
              <button
                type="button"
                onClick={handleSearchExecute}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-sm active:scale-95"
              >
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="relative min-w-50">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 h-4 w-4 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-[#F5F8F5] border border-emerald-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
              >
                <option value="">{t.allInventory.allCategories}</option>
                {CATEGORIES_MAP.map((cat) => (
                  <option key={cat.en} value={cat.en}>
                    {locale === 'bn' ? cat.bn : cat.en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {inventoryLoading ? (
          <div className="min-h-100 flex flex-col items-center justify-center bg-white rounded-2xl border border-emerald-100/60">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          </div>
        ) : !allInventories?.inventory || allInventories.inventory.length === 0 ? (
          <div className="min-h-100 flex flex-col items-center justify-center bg-white rounded-2xl border border-emerald-100/60 p-8 text-center">
            <div className="bg-emerald-50 p-4 rounded-full mb-3">
              <Search className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">
              {t.allInventory.noItemsFound}
            </h3>
          </div>
        ) : (
          <>
            {/* Inventory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allInventories.inventory.map((item) => {
                const categoryObj = CATEGORIES_MAP.find((c) => c.en === item.category)
                const categoryDisplay = categoryObj
                  ? locale === 'bn' ? categoryObj.bn : categoryObj.en
                  : item.category

                return (
                  <Link
                    key={item._id}
                    href={`/inventory/${item._id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-emerald-100/80 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      {item.image?.url ? (
                        <Image
                          src={item.image.url}
                          alt={item.productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold text-2xl">
                          {item.productName.charAt(0)}
                        </div>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
                          item.status === 'available'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {item.status === 'available'
                          ? t.allInventory.available
                          : t.allInventory.depleted}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">
                          {categoryDisplay}
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {item.productName}
                        </h2>
                      </div>

                      {/* Price & Quantity Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-sm">
                        <div>
                          <p className="text-xs text-slate-400">{t.allInventory.price}</p>
                          <p className="font-bold text-emerald-800">
                            ৳{item.pricePerUnit}{' '}
                            <span className="text-xs font-normal text-slate-500">
                              /{item.unit}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">{t.allInventory.quantity}</p>
                          <p className="font-semibold text-slate-700">
                            {item.totalQuantity} {item.unit}
                          </p>
                        </div>
                      </div>

                      {/* Link Footer */}
                      <div className="pt-2 flex items-center justify-between text-xs font-medium text-emerald-700 group-hover:text-emerald-800">
                        <span>{t.allInventory.viewDetails}</span>
                        <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {allInventories.pagination && allInventories.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-emerald-100/60 shadow-sm mt-8">
                <p className="text-sm text-slate-600">
                  {t.allInventory.page}{' '}
                  <span className="font-semibold text-emerald-800">
                    {allInventories.pagination.currentPage}
                  </span>{' '}
                  {t.allInventory.of}{' '}
                  <span className="font-semibold text-emerald-800">
                    {allInventories.pagination.totalPages}
                  </span>
                </p>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= allInventories.pagination.totalPages}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}