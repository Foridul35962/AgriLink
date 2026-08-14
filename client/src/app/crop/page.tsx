"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "@/context/LanguageContext";
import { getAllCrops } from "@/store/slice/cropSlice";
import { AppDispatch, RootState } from "@/store/store";
import { Search, Filter, X, Droplets, Sprout, ArrowLeft, ArrowRight, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { CATEGORIES_MAP } from "@/constants/constantValues";

const CropListPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const { locale, t } = useLanguage();
  const { cropLoading, allCrops } = useSelector((state: RootState) => state.crop);
  const { user } = useSelector((state: RootState) => state.auth);

  // URL Query Params
  const pageParam = searchParams.get("page");
  const nameParam = searchParams.get("name") || "";
  const categoryParam = searchParams.get("category") || "";

  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  // Local state for search & category filter inputs
  const [searchName, setSearchName] = useState(nameParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  // Sync state if URL search params change externally
  useEffect(() => {
    setSearchName(nameParam);
    setSelectedCategory(categoryParam);
  }, [nameParam, categoryParam]);

  useEffect(() => {
    if (!pageParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pageParam, pathname, router, searchParams]);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        await dispatch(
          getAllCrops({
            page: currentPage,
            name: nameParam || undefined,
            category: categoryParam || undefined,
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to fetch crops:", error);
      }
    };

    fetchCrops();
  }, [currentPage, nameParam, categoryParam, dispatch]);

  console.log(allCrops);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");

    if (searchName.trim()) {
      params.set("name", searchName.trim());
    } else {
      params.delete("name");
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSelectedCategory("");
    router.push(`${pathname}?page=1`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper helper function to get translated category name
  const getCategoryLabel = (categoryEn: string) => {
    const matched = CATEGORIES_MAP.find((item) => item.en.toLowerCase() === categoryEn.toLowerCase());
    if (!matched) return categoryEn;
    return locale === "bn" ? matched.bn : matched.en;
  };

  const pagination = allCrops?.pagination;
  const isFiltered = Boolean(nameParam || categoryParam);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 p-8 sm:p-10 text-white shadow-lg">
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none text-white">
            <Sprout size={280} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-emerald-300 text-xs font-medium">
                <Sprout className="w-3.5 h-3.5" />
                <span>{t.cropList?.title || "Crop Directory"}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {t.cropList?.title || "Crop Directory"}
              </h1>
              <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                {t.cropList?.subtitle || "Explore crops suitable for your land and farming needs"}
              </p>
            </div>

            {user?.role === "admin" && (
              <Link
                href="/crop/create"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-emerald-900/30 whitespace-nowrap self-start sm:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Crop</span>
              </Link>
            )}
          </div>
        </div>

        {/* Filter & Search Form */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-center">

            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder={t.cropList?.searchPlaceholder || "Search crops..."}
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder:text-slate-400 text-sm"
              />
              {searchName && (
                <button
                  type="button"
                  onClick={() => setSearchName("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdown & Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">

              <div className="relative w-full sm:w-60">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-700 text-sm font-medium appearance-none cursor-pointer"
                >
                  <option value="">{t.cropList?.allCategories || "All Categories"}</option>
                  {CATEGORIES_MAP.map((cat) => (
                    <option key={cat.en} value={cat.en}>
                      {locale === "bn" ? cat.bn : cat.en}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
              </div>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>{t.cropList?.searchBtn || "Search"}</span>
              </button>

              {/* Clear Filters Button */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <X className="w-4 h-4" />
                  <span>{t.cropList?.clearFilters || "Clear"}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Content Section */}
        {cropLoading ? (
          /* Loading Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-80">
                <div className="h-48 bg-slate-200 w-full" />
                <div className="p-5 flex-1 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {allCrops?.crops && allCrops.crops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {allCrops.crops.map((crop) => (
                  <Link
                    key={crop._id}
                    href={`/crop/${crop._id}`}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={crop.image?.url || "/placeholder-crop.png"}
                        alt={crop.name || "Crop image"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {crop.category && (
                        <span className="absolute top-3 left-3 bg-white/95 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 capitalize">
                          {getCategoryLabel(crop.category)}
                        </span>
                      )}
                    </div>

                    {/* Crop Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Crop Name with Fallback */}
                        <h2 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">
                          {locale === "bn" ? crop.banglaName || crop.name : crop.name || crop.banglaName}
                        </h2>

                        {/* Water Requirement */}
                        {crop.waterRequirement && (
                          <div className="mt-2.5 space-y-1.5 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Droplets className="w-3.5 h-3.5 text-sky-500" />
                              <span>{t.cropList?.waterRequirement || "Water Requirement"}:</span>
                              <span className="font-semibold text-slate-700 capitalize">
                                {t.cropList?.waterLevels?.[crop.waterRequirement] || crop.waterRequirement}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Suitable Soil List */}
                      {crop.suitableSoil && crop.suitableSoil.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            <span>{t.cropList?.suitableSoil || "Suitable Soil"}:</span>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {crop.suitableSoil.map((soil, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 text-slate-700 border border-slate-200/60 text-[11px] px-2 py-0.5 rounded-md font-medium"
                              >
                                {soil}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-sm">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sprout className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  {t.cropList?.noCrops || "No crops found"}
                </h3>
                <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                  {t.cropList?.noCropsDescription || "Try changing your search or filter options."}
                </p>
                {isFiltered && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-xl text-xs transition-all shadow-sm"
                  >
                    {t.cropList?.clearFilters || "Clear Filters"}
                  </button>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="p-2.5 sm:px-4 sm:py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-1 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.cropList?.prev || "Previous"}</span>
                </button>

                <div className="text-xs sm:text-sm font-semibold text-slate-700 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  {t.cropList?.page || "Page"} <span className="text-emerald-700 font-bold">{pagination.currentPage}</span> {t.cropList?.of || "of"} {pagination.totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="p-2.5 sm:px-4 sm:py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-1 shadow-sm"
                >
                  <span className="hidden sm:inline">{t.cropList?.next || "Next"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CropListPage;