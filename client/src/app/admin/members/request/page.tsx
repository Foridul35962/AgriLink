"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Loader2,
  UserCheck,
  SearchX,
} from "lucide-react";

import { AppDispatch, RootState } from "@/store/store";
import { acceptRequest, getRequestedMembers, rejectRequest } from "@/store/slice/adminSlice";
import { Pagination, RequestedUser } from "@/types/adminTypes";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminMemberRequestsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Redux state
  const { adminLoading, allUserReqMembers } = useSelector(
    (state: RootState) => state.admin
  );

  // URL Query Parameters
  const pageFromUrl = searchParams.get("page");
  const roleFromUrl = searchParams.get("role") || "";
  const currentPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;

  // Local state for optimistic UI updates & processing
  const [usersList, setUsersList] = useState<RequestedUser[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Initial load check to avoid UI flash on first page mount
  const isInitialMount = useRef(true);

  // by default URL page=1 set
  useEffect(() => {
    if (!pageFromUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pageFromUrl, pathname, router, searchParams]);

  // set user list
  useEffect(() => {
    if (allUserReqMembers?.users) {
      setUsersList(allUserReqMembers.users);
    }
  }, [allUserReqMembers]);

  const pagination: Pagination = allUserReqMembers?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 15,
  };

  // set params
  const fetchRequests = useCallback(() => {
    const paramsObj: { page: number; role?: string } = {
      page: currentPage,
    };

    if (roleFromUrl) {
      paramsObj.role = roleFromUrl;
    }

    dispatch(getRequestedMembers(paramsObj));
  }, [dispatch, currentPage, roleFromUrl]);

  useEffect(() => {
    fetchRequests();
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [currentPage, roleFromUrl, fetchRequests]);

  // ৪. Helper Function: URL Query Parameter আপডেট করার জন্য
  const updateQueryParams = (newPage: number, newRole?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());

    const activeRole = newRole !== undefined ? newRole : roleFromUrl;
    if (activeRole) {
      params.set("role", activeRole);
    } else {
      params.delete("role");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // Role ফিল্টার চেঞ্জ হ্যান্ডলার
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    updateQueryParams(1, selectedRole);
  };

  // Pagination পেজ চেঞ্জ হ্যান্ডলার
  const handlePageChange = (newPage: number) => {
    updateQueryParams(newPage);
  };

  // Accept Handler (UI থেকে ইনস্ট্যান্ট রিমুভ - No re-fetch)
  const handleAccept = async (userId: string) => {
    setProcessingId(userId);
    try {
      await dispatch(acceptRequest({ userId })).unwrap();
      setUsersList((prevUsers) => prevUsers.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Failed to accept user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Handler (UI থেকে ইনস্ট্যান্ট রিমুভ - No re-fetch)
  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    try {
      await dispatch(rejectRequest({ userId })).unwrap();
      setUsersList((prevUsers) => prevUsers.filter((u) => u._id !== userId));
    } catch (error) {
      console.error("Failed to reject user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Role Display Label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "farmer":
        return t.adminMemberRequests.roles.farmer;
      case "aratdar":
        return t.adminMemberRequests.roles.aratdar;
      case "retailer":
        return t.adminMemberRequests.roles.retailer;
      default:
        return role;
    }
  };

  // Role Badge Styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "farmer":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "aratdar":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "retailer":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // কেবল একদম প্রথম লোডিং-এর সময়ে Skeleton দেখাবে
  const showInitialSkeleton = adminLoading && isInitialMount.current && usersList.length === 0;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8">
      {/* Background Decorators */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t.adminMemberRequests.header.title}
              </h1>
              <p className="text-sm text-slate-500">
                {t.adminMemberRequests.header.subtitle}
              </p>
            </div>
          </div>

          {/* Filter Option */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={roleFromUrl}
              onChange={handleRoleChange}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer pr-2"
            >
              <option value="">{t.adminMemberRequests.filter.allRoles}</option>
              <option value="farmer">{t.adminMemberRequests.filter.farmer}</option>
              <option value="aratdar">{t.adminMemberRequests.filter.aratdar}</option>
              <option value="retailer">{t.adminMemberRequests.filter.retailer}</option>
            </select>
          </div>
        </div>

        {/* Total Stats Strip */}
        <div className="flex items-center justify-between px-2 text-sm text-slate-500">
          <p>
            {t.adminMemberRequests.stats.showing}{" "}
            <span className="font-semibold text-slate-800">{usersList.length}</span>{" "}
            {t.adminMemberRequests.stats.of}{" "}
            <span className="font-semibold text-slate-800">{pagination.totalUsers}</span>{" "}
            {t.adminMemberRequests.stats.pendingRequests}
          </p>
          {roleFromUrl && (
            <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2.5 py-1 rounded-full">
              {t.adminMemberRequests.stats.filterLabel}: {getRoleLabel(roleFromUrl)}
            </span>
          )}
        </div>

        {/* Requests Table Area */}
        <div className="relative bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 overflow-hidden min-h-40">
          
          {/* Subtle Progress Bar (re-fetch হওয়ার সময় উপরে ছোট একটাস্মুথ লাইন দেখাবে, UI ঝাঁকি মারবে না) */}
          {adminLoading && !showInitialSkeleton && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-100 overflow-hidden z-20">
              <div className="h-full bg-emerald-600 animate-pulse w-full" />
            </div>
          )}

          {showInitialSkeleton ? (
            /* Skeleton Loading State (Only on first page load) */
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-100 animate-pulse rounded-2xl w-full"
                />
              ))}
            </div>
          ) : usersList.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <SearchX size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {t.adminMemberRequests.emptyState.title}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {t.adminMemberRequests.emptyState.subtitle}
              </p>
            </div>
          ) : (
            /* Table Data */
            <div className={`overflow-x-auto transition-opacity duration-200 ${adminLoading ? "opacity-60 pointer-events-none" : "opacity-100"}`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">{t.adminMemberRequests.table.memberName}</th>
                    <th className="py-4 px-6">{t.adminMemberRequests.table.role}</th>
                    <th className="py-4 px-6">{t.adminMemberRequests.table.contactInfo}</th>
                    <th className="py-4 px-6">{t.adminMemberRequests.table.district}</th>
                    <th className="py-4 px-6 text-right">{t.adminMemberRequests.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {/* mode="popLayout" ঝাঁকি মারা বা ঝটকা দূর করবে */}
                  <AnimatePresence mode="popLayout">
                    {usersList.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-emerald-50/30 transition-colors duration-150"
                      >
                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center uppercase shrink-0">
                              {user.name?.charAt(0) || "U"}
                            </div>
                            <span className="font-semibold text-slate-900">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                              user.role
                            )}`}
                          >
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        {/* Contact Info */}
                        <td className="py-4 px-6 space-y-1">
                          {user.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Phone size={14} className="text-slate-400 shrink-0" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          )}
                          {user.email && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Mail size={14} className="text-slate-400 shrink-0" />
                              <span>{user.email}</span>
                            </div>
                          )}
                        </td>

                        {/* District */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <MapPin size={15} className="text-emerald-600 shrink-0" />
                            <span className="font-medium">{user.district}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={processingId === user._id}
                              onClick={() => handleAccept(user._id)}
                              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all duration-150 disabled:opacity-50"
                            >
                              {processingId === user._id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={15} />
                              )}
                              {t.adminMemberRequests.actions.accept}
                            </button>

                            <button
                              disabled={processingId === user._id}
                              onClick={() => handleReject(user._id)}
                              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all duration-150 disabled:opacity-50"
                            >
                              {processingId === user._id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <XCircle size={15} />
                              )}
                              {t.adminMemberRequests.actions.reject}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                {t.adminMemberRequests.pagination.page} {currentPage}{" "}
                {t.adminMemberRequests.pagination.of} {pagination.totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1 || adminLoading}
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(pagination.totalPages)].map((_, idx) => {
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
                  disabled={currentPage === pagination.totalPages || adminLoading}
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, pagination.totalPages))
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