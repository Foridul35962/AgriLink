"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { ShoppingBag, Eye, ChevronLeft, ChevronRight, Clock, PackageCheck } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { getRetailerPlacedOrder } from '@/store/slice/orderSlice'
import { AppDispatch, RootState } from '@/store/store'

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  
  // URL থেকে page পরামিতি নেওয়া (ডিফল্ট ১)
  const pageFromUrl = Number(searchParams.get('page')) || 1

  const { orderLoading, retailerPlaceOrders } = useSelector((state: RootState) => state.order)
  const { t } = useLanguage()

  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")

  // URL-এ ডিফল্ট page=1 সেট করা (যদি URL-এ না থাকে)
  useEffect(() => {
    if (!searchParams.get('page')) {
      router.replace('/retailer/order?page=1')
    }
  }, [searchParams, router])

  // URL parameters অনুযায়ী API কল করা
  useEffect(() => {
    dispatch(getRetailerPlacedOrder({ page: pageFromUrl }))
  }, [dispatch, pageFromUrl])

  // পেজ পরিবর্তন করার ফাংশন (URL params আপডেট করা)
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`?${params.toString()}`)
  }

  // Status Badge Styling Helper
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

  const orders = retailerPlaceOrders?.orders || []
  const pagination = retailerPlaceOrders?.pagination || { totalPages: 1, currentPage: 1 }

  // Filter local items if status is selected
  const filteredOrders = selectedStatus === "ALL" 
    ? orders 
    : orders.filter((o) => o.status === selectedStatus)

  // Initial Skeleton Loading Screen (Only on initial load)
  if (orderLoading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
          <div className="bg-white rounded-2xl border border-emerald-100/80 p-6 shadow-xs space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8 text-gray-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-emerald-100/80 shadow-xs">
          <div>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-emerald-700" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t.retailersPlacedOrders.title}
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t.retailersPlacedOrders.subtitle}
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2.5 rounded-xl border border-emerald-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="ALL">{t.retailersPlacedOrders.allStatus}</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-xs overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-emerald-100/60 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-4 px-6">{t.retailersPlacedOrders.orderId}</th>
                    <th className="py-4 px-6">{t.retailersPlacedOrders.product}</th>
                    <th className="py-4 px-6">{t.retailersPlacedOrders.quantity}</th>
                    <th className="py-4 px-6">{t.retailersPlacedOrders.totalAmount}</th>
                    <th className="py-4 px-6">{t.retailersPlacedOrders.status}</th>
                    <th className="py-4 px-6">{t.retailersPlacedOrders.date}</th>
                    <th className="py-4 px-6 text-right">{t.retailersPlacedOrders.action}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-gray-900">
                        #{order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {order.inventoryId?.image?.url ? (
                            <Image
                              src={order.inventoryId.image.url}
                              alt={order.inventoryId.productName || 'Product'}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-lg object-cover border border-emerald-100"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-800 font-bold text-xs">
                              N/A
                            </div>
                          )}
                          <span className="font-semibold text-gray-800">
                            {order.inventoryId?.productName || 'Unknown Product'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-700">
                        {order.quantity} {order.unit}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-800">
                        ৳{order.totalAmount?.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/retailer/order/${order._id}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-xs transition border border-emerald-200/60"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t.retailersPlacedOrders.viewDetails}</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 text-center space-y-3">
              <PackageCheck className="w-12 h-12 text-emerald-600/60 mx-auto" />
              <h3 className="text-lg font-bold text-gray-800">
                {t.retailersPlacedOrders.noOrders}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {t.retailersPlacedOrders.noOrdersDesc}
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-emerald-50/20">
              <p className="text-xs text-gray-500">
                {t.retailersPlacedOrders.page} <span className="font-semibold text-gray-800">{pageFromUrl}</span> {t.retailersPlacedOrders.of} <span className="font-semibold text-gray-800">{pagination.totalPages}</span>
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(pageFromUrl - 1, 1))}
                  disabled={pageFromUrl <= 1 || orderLoading}
                  className="p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(pageFromUrl + 1, pagination.totalPages))}
                  disabled={pageFromUrl >= pagination.totalPages || orderLoading}
                  className="p-2 rounded-lg border border-emerald-200 bg-white hover:bg-emerald-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Page