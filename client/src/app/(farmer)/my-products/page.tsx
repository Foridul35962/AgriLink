"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Tag,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Coins,
  Plus,
} from "lucide-react";

import { AppDispatch, RootState } from "@/store/store";
import { getAllMyProducts } from "@/store/slice/productSlice";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_VALUES } from "@/constants/constantValues";

export const STATUS_VALUES = ["available", "sold", "expired"];

export default function MyProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { t, locale  } = useLanguage();

  // Redux state
  const { myProducts, productLoading } = useSelector(
    (state: RootState) => state.product
  );

  // URL parameters
  const pageFromUrl = searchParams.get("page");
  const categoryFromUrl = searchParams.get("category") || "";
  const statusFromUrl = searchParams.get("status") || "";

  const currentPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
  const isInitialMount = useRef(true);

  // বাই-ডিফল্ট URL-এ page=1 নিশ্চিত করা
  useEffect(() => {
    if (!pageFromUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pageFromUrl, pathname, router, searchParams]);

  // Backend API থেকে ইংরেজি ভ্যালু অনুযায়ী ডাটা ফেচ করা
  const fetchProducts = useCallback(() => {
    const paramsObj: { page: number; category?: string; status?: string } = {
      page: currentPage,
    };

    if (categoryFromUrl) paramsObj.category = categoryFromUrl;
    if (statusFromUrl) paramsObj.status = statusFromUrl;

    dispatch(getAllMyProducts(paramsObj));
  }, [dispatch, currentPage, categoryFromUrl, statusFromUrl]);

  useEffect(() => {
    fetchProducts();
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [fetchProducts]);

  // URL Parameter
  const updateQueryParams = (
    newPage: number,
    newCategory?: string,
    newStatus?: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", newPage.toString());

    const activeCategory =
      newCategory !== undefined ? newCategory : categoryFromUrl;
    if (activeCategory) {
      params.set("category", activeCategory);
    } else {
      params.delete("category");
    }

    const activeStatus = newStatus !== undefined ? newStatus : statusFromUrl;
    if (activeStatus) {
      params.set("status", activeStatus);
    } else {
      params.delete("status");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams(1, e.target.value, undefined);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams(1, undefined, e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams(newPage);
  };

  const { products = [], pagination } = myProducts || {};
  const totalPages = pagination?.totalPages || 1;

  // Status Badge
  const getStatusBadge = (statusKey: string) => {
    const translatedLabel =
      t.myProducts.status[statusKey as keyof typeof t.myProducts.status] ||
      statusKey;

    switch (statusKey) {
      case "available":
        return {
          bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 size={13} className="mr-1" />,
          label: translatedLabel,
        };
      case "sold":
        return {
          bg: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Tag size={13} className="mr-1" />,
          label: translatedLabel,
        };
      case "expired":
        return {
          bg: "bg-rose-100 text-rose-800 border-rose-200",
          icon: <XCircle size={13} className="mr-1" />,
          label: translatedLabel,
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-800 border-slate-200",
          icon: <Clock size={13} className="mr-1" />,
          label: translatedLabel,
        };
    }
  };

  // Category Translation
  const getCategoryTranslation = (catKey: string) => {
    return (
      t.myProducts.categories[
        catKey as keyof typeof t.myProducts.categories
      ] || catKey
    );
  };

  const showInitialSkeleton =
    productLoading && isInitialMount.current && products.length === 0;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8">
      {/* Background Ambient Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t.myProducts.title}
              </h1>
              <p className="text-sm text-slate-500">
                {t.myProducts.subtitle}
              </p>
            </div>
          </div>

          {/* Right Action Area: Add Product Button & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* ➕ Add Product Button */}
            <Link
              href="/products/add"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all duration-200"
            >
              <Plus size={18} />
              <span>
                {locale === "bn" ? "নতুন পণ্য যোগ করুন" : "Add Product"}
              </span>
            </Link>

            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={categoryFromUrl}
                onChange={handleCategoryChange}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="">{t.myProducts.allCategories}</option>
                {CATEGORY_VALUES.map((catKey) => (
                  <option key={catKey} value={catKey}>
                    {getCategoryTranslation(catKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
              <Layers size={16} className="text-slate-400" />
              <select
                value={statusFromUrl}
                onChange={handleStatusChange}
                className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="">{t.myProducts.allStatuses}</option>
                {STATUS_VALUES.map((stKey) => (
                  <option key={stKey} value={stKey}>
                    {
                      t.myProducts.status[
                        stKey as keyof typeof t.myProducts.status
                      ]
                    }
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-between px-2 text-sm text-slate-500">
          <p>
            {t.myProducts.showing}{" "}
            <span className="font-semibold text-slate-800">
              {products.length}
            </span>{" "}
            {t.myProducts.of}{" "}
            <span className="font-semibold text-slate-800">
              {pagination?.totalProducts || 0}
            </span>{" "}
            {t.myProducts.products}
          </p>
        </div>

        {/* Main Content Area */}
        <div className="relative bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 overflow-hidden p-6">
          {productLoading && !showInitialSkeleton && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-100 overflow-hidden z-20">
              <div className="h-full bg-emerald-600 animate-pulse w-full" />
            </div>
          )}

          {showInitialSkeleton ? (
            /* Skeleton Loader */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-100 animate-pulse rounded-2xl w-full"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <SearchX size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {t.myProducts.noProductsFound}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {t.myProducts.noProductsDesc}
              </p>
              
              {/* Empty state bottom action */}
              <div className="pt-2">
                <Link
                  href="/products/add"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm transition"
                >
                  <Plus size={16} />
                  <span>
                    {locale === "bn" ? "প্রথম পণ্য যোগ করুন" : "Add First Product"}
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            /* Product Cards Grid */
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${
                productLoading ? "opacity-60 pointer-events-none" : "opacity-100"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {products.map((product) => {
                  const badge = getStatusBadge(product.status);
                  return (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between"
                    >
                      <Link
                        href={`/products/${product._id}`}
                        className="h-full flex flex-col justify-between"
                      >
                        <div>
                          {/* Image & Tags */}
                          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                            {product.image?.url ? (
                              <img
                                src={product.image.url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-slate-400">
                                <Package size={40} />
                              </div>
                            )}

                            {/* Translated Category Badge */}
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                              {getCategoryTranslation(product.category)}
                            </span>

                            {/* Translated Status Badge */}
                            <span
                              className={`absolute top-3 right-3 border ${badge.bg} text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center shadow-sm`}
                            >
                              {badge.icon}
                              {badge.label}
                            </span>
                          </div>

                          {/* Product Information */}
                          <div className="p-4 space-y-2">
                            <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-emerald-700 transition-colors">
                              {product.name}
                            </h3>

                            <div className="flex items-center justify-between text-sm text-slate-600 pt-1">
                              <span className="flex items-center gap-1 text-slate-500 text-xs">
                                <Package size={14} /> {t.myProducts.quantity}:
                              </span>
                              <span className="font-semibold text-slate-800">
                                {product.quantity} {product.unit}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-slate-600">
                              <span className="flex items-center gap-1 text-slate-500 text-xs">
                                <Coins size={14} /> {t.myProducts.pricePer}{" "}
                                {product.unit}:
                              </span>
                              <span className="font-bold text-emerald-600 text-base">
                                ৳{product.pricePerUnit}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 pt-0 border-t border-slate-50 mt-2">
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                            <span>{t.myProducts.totalValue}</span>
                            <span className="font-semibold text-slate-700">
                              ৳{product.pricePerUnit * product.quantity}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <span className="text-xs text-slate-500 font-medium">
                {t.myProducts.page} {currentPage} {t.myProducts.of}{" "}
                {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1 || productLoading}
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
                          currentPage === pageNum
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages || productLoading}
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}