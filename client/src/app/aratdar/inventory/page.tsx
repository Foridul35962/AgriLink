"use client"

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { getMyInventory } from '@/store/slice/inventorySlice'
import { useLanguage } from '@/context/LanguageContext'
import { Search, Filter, ChevronLeft, ChevronRight, Package, ArrowUpRight } from 'lucide-react'
import { CATEGORIES_MAP, CATEGORY_VALUES } from '@/constants/constantValues'


const InventoryPage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t, locale } = useLanguage()

  const { myInventories, inventoryLoading } = useSelector((state: RootState) => state.inventory)

  // URL Query Params State
  const currentPage = Number(searchParams.get('page')) || 1
  const searchCategory = searchParams.get('category') || ''
  const searchName = searchParams.get('productName') || ''

  // Local Filter States
  const [productNameInput, setProductNameInput] = useState(searchName)
  const [selectedCategory, setSelectedCategory] = useState(searchCategory)
  const [, startTransition] = useTransition()

  // Helper function to update URL search parameters
  const updateQueryParams = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Ensure default `page=1` in URL
  useEffect(() => {
    if (!searchParams.has('page')) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', '1')
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [searchParams, pathname, router])

  // Fetch Inventory Data on Params Change
  useEffect(() => {
    if (searchCategory && !CATEGORY_VALUES.includes(searchCategory)) {
      return
    }
    dispatch(getMyInventory({
      page: currentPage,
      productName: searchName || undefined,
      category: searchCategory || undefined
    }))
  }, [dispatch, currentPage, searchName, searchCategory])

  // Handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateQueryParams({
      page: 1,
      productName: productNameInput.trim(),
      category: selectedCategory
    })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedCategory(value)
    updateQueryParams({
      page: 1,
      productName: productNameInput.trim(),
      category: value
    })
  }

  const handleResetFilters = () => {
    setProductNameInput('')
    setSelectedCategory('')
    router.push(`${pathname}?page=1`)
  }

  const pagination = myInventories?.pagination
  const inventories = myInventories?.inventories || []

  // Dynamic category mapping based on current active language
  const getCategoryLabel = (categoryEn: string) => {
    const found = CATEGORIES_MAP.find((item) => item.en.toLowerCase() === categoryEn.toLowerCase())
    if (!found) return categoryEn
    return locale === 'bn' ? found.bn : found.en
  }

  return (
    <div className="min-h-screen bg-[#F5F8F5] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950">
              {t.myInventory.title}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {t.myInventory.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-200 text-sm font-semibold">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>
              {t.myInventory.totalItems}{' '}
              <strong className="text-emerald-900">{pagination?.totalInventories || 0}</strong>
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-emerald-100">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={productNameInput}
                onChange={(e) => setProductNameInput(e.target.value)}
                placeholder={t.myInventory.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            {/* Category Select */}
            <div className="relative md:col-span-4">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-800 appearance-none bg-white transition cursor-pointer"
              >
                <option value="">{t.myInventory.allCategories}</option>
                {CATEGORIES_MAP.map((cat) => (
                  <option key={cat.en} value={cat.en}>
                    {locale === 'bn' ? cat.bn : cat.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl transition shadow-sm text-center text-sm"
              >
                {t.myInventory.searchBtn}
              </button>
              {(searchName || searchCategory) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition border border-slate-200 text-sm font-medium"
                >
                  {t.myInventory.resetBtn}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Content Section */}
        {inventoryLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm animate-pulse space-y-3">
                <div className="w-full h-44 bg-slate-200 rounded-xl"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="pt-2 flex justify-between">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : inventories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-emerald-100 p-12 text-center max-w-md mx-auto shadow-sm my-8">
            <Package className="w-16 h-16 text-emerald-300 mx-auto mb-4 stroke-1" />
            <h3 className="text-lg font-semibold text-slate-800">
              {t.myInventory.noDataTitle}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {t.myInventory.noDataSub}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventories.map((item) => (
              <Link
                key={item._id}
                href={`/inventory/${item._id}`}
                className="group bg-white rounded-2xl border border-emerald-100/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative w-full h-44 bg-emerald-50/50 overflow-hidden">
                  <img
                    src={item.image?.url || '/placeholder-food.png'}
                    alt={item.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm ${item.status === 'available'
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-rose-500/90 text-white'
                      }`}
                  >
                    {item.status === 'available'
                      ? t.myInventory.statusAvailable
                      : t.myInventory.statusDepleted}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {getCategoryLabel(item.category)}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-emerald-700 transition mt-2 line-clamp-1">
                      {item.productName}
                    </h3>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{t.myInventory.totalQty}</span>
                      <span className="font-semibold text-slate-800">
                        {item.totalQuantity} {item.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">{t.myInventory.pricePerUnit}</span>
                      <span className="font-bold text-emerald-700">
                        ৳{item.pricePerUnit} / {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:underline">
                    <span>{t.myInventory.viewDetails}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-600">
              {t.myInventory.page} <span className="font-bold text-slate-800">{pagination.currentPage}</span> {t.myInventory.of} <span className="font-bold text-slate-800">{pagination.totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage <= 1 || inventoryLoading}
                onClick={() => updateQueryParams({ page: pagination.currentPage - 1 })}
                className="flex items-center gap-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.myInventory.prevBtn}</span>
              </button>

              <button
                disabled={pagination.currentPage >= pagination.totalPages || inventoryLoading}
                onClick={() => updateQueryParams({ page: pagination.currentPage + 1 })}
                className="flex items-center gap-1 px-3.5 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-slate-200 transition font-medium"
              >
                <span>{t.myInventory.nextBtn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default InventoryPage