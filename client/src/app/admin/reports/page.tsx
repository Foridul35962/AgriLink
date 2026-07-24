"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FileText,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Inbox,
  RefreshCw,
} from "lucide-react";

import { AppDispatch, RootState } from "@/store/store";
import { useLanguage } from "@/context/LanguageContext";
import { getAllReport } from "@/store/slice/reportSlice";

export default function AdminReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLanguage();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  const { allReports, reportLoading } = useSelector(
    (state: RootState) => state.report
  );

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.replace("/admin/reports?page=1", { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    dispatch(getAllReport({ page: pageFromUrl }));
  }, [dispatch, pageFromUrl]);

  const reportsList = allReports?.reports || [];
  const pagination = allReports?.pagination;

  // Page Change Handler
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    router.push(`/admin/reports?page=${newPage}`);
  };

  // Refresh / Reset Handler
  const handleRefresh = () => {
    dispatch(getAllReport({ page: 1 }));
    router.push("/admin/reports?page=1");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      {/* Background Gradients & Glassmorphism Aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-100/60 via-slate-50 to-slate-100 pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-150 h-87.5 bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.06] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center sm:text-left mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 border border-emerald-200/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-3 shadow-sm">
            <ShieldAlert size={14} className="text-emerald-700" />
            <span>{t.adminReports?.badge || "Admin Portal"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.adminReports?.title || "Submitted Reports"}
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {t.adminReports?.subtitle ||
              "Manage and review all system reports submitted by users."}
          </p>
        </motion.div>

        {/* Reports Table/Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-xl overflow-hidden"
        >
          {reportLoading ? (
            /* Skeleton Loading State */
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
                  <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : reportsList.length === 0 ? (
            /* Enhanced Empty State Design */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center"
            >
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
                  <Inbox size={38} className="text-emerald-600/80" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-400">
                  <FileText size={14} />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-800">
                {t.adminReports?.emptyState?.title || "No Reports Found"}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md">
                {t.adminReports?.emptyState?.description ||
                  "There are currently no reports submitted in the system. Check back later or refresh the list."}
              </p>

              <button
                onClick={handleRefresh}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition duration-200 shadow-sm"
              >
                <RefreshCw size={14} />
                <span>
                  {t.adminReports?.emptyState?.refresh || "Refresh List"}
                </span>
              </button>
            </motion.div>
          ) : (
            /* Reports Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">
                      {t.adminReports?.table?.id || "Report ID"}
                    </th>
                    <th className="py-4 px-6">
                      {t.adminReports?.table?.topic || "Topic / Summary"}
                    </th>
                    <th className="py-4 px-6 text-right">
                      {t.adminReports?.table?.action || "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {reportsList.map((report) => (
                    <tr
                      key={report._id}
                      className="group hover:bg-emerald-50/40 transition-colors duration-150"
                    >
                      <td className="py-4 px-6 font-mono text-xs text-slate-500 font-medium">
                        #{report._id.slice(-8)}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <FileText
                            size={16}
                            className="text-emerald-600 shrink-0"
                          />
                          <span className="line-clamp-1">{report.topic}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/reports/${report._id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-lg transition duration-200 group-hover:shadow-sm"
                        >
                          <span>
                            {t.adminReports?.table?.viewDetails ||
                              "View Details"}
                          </span>
                          <ChevronRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!reportLoading &&
            reportsList.length > 0 &&
            pagination &&
            pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="text-xs text-slate-500">
                  {t.adminReports?.pagination?.showing || "Showing"}{" "}
                  <span className="font-semibold text-slate-700">
                    {reportsList.length}
                  </span>{" "}
                  {t.adminReports?.pagination?.of || "of"}{" "}
                  <span className="font-semibold text-slate-700">
                    {pagination.totalReports}
                  </span>{" "}
                  {t.adminReports?.pagination?.reports || "reports"}
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handlePageChange(pageFromUrl - 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150"
                  >
                    <ArrowLeft size={14} />
                    <span>
                      {t.adminReports?.pagination?.previous || "Previous"}
                    </span>
                  </button>

                  {/* Page Number Buttons */}
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`text-xs font-semibold h-8 w-8 rounded-lg transition duration-150 ${
                            pageNum === pagination.page
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(pageFromUrl + 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition duration-150"
                  >
                    <span>{t.adminReports?.pagination?.next || "Next"}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
        </motion.div>
      </div>
    </div>
  );
}