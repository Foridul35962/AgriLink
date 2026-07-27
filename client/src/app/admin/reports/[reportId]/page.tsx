"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Loader2,
  Calendar,
  History,
  FileText,
  AlertOctagon,
  X,
} from "lucide-react";

import { AppDispatch, RootState } from "@/store/store";
import {
  getReport,
  sendReportWarning,
  setReportViewDone,
} from "@/store/slice/reportSlice";
import { deleteMember } from "@/store/slice/adminSlice";

import { useLanguage } from "@/context/LanguageContext";
import { ViewReportByIdResponse } from "@/types/reportTypes";
import { toast } from "react-toastify";

interface DeleteModalTarget {
  userId: string;
  userName: string;
  userRoleKey: "reporter" | "reportedUser";
}

export default function AdminReportReviewPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { reportId } = useParams();

  // Purely using t from LanguageContext as requested
  const { t } = useLanguage();
  const router = useRouter()

  const { report, reportLoading } = useSelector(
    (state: RootState) => state.report
  ) as { report: ViewReportByIdResponse | null; reportLoading: boolean };

  const [isWarningLoading, setIsWarningLoading] = useState(false);
  const [isMarkingLoading, setIsMarkingLoading] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteModalTarget | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  useEffect(() => {
    if (reportId && report?.report?._id !== reportId) {
      dispatch(getReport({ reportId: reportId as string }));
    }
  }, [dispatch, reportId, report]);

  const handleSendWarning = async () => {
    if (!reportId) return;
    try {
      setIsWarningLoading(true);
      await dispatch(
        sendReportWarning({ reportId: reportId as string })
      ).unwrap();
      setShowWarningModal(false);
      toast.success("send warning successfully")
      router.push("/admin/reports")
    } catch (error) {
      console.error("Failed to send warning:", error);
    } finally {
      setIsWarningLoading(false);
    }
  };

  const openDeleteModal = (
    userId: string,
    userName: string,
    userRoleKey: "reporter" | "reportedUser"
  ) => {
    setDeleteTarget({ userId, userName, userRoleKey });
    setDeleteReason("");
  };

  const handleConfirmRemoveUser = async () => {
    if (!deleteTarget || !reportId) return;

    try {
      setIsDeletingLoading(true);
      await dispatch(
        deleteMember({
          reportId: reportId as string,
          userId: deleteTarget.userId,
          reason: deleteReason.trim(),
        })
      ).unwrap();

      setDeleteTarget(null);
      setDeleteReason("");
    } catch (error) {
      console.error(`Failed to remove user:`, error);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleMarkAsReviewed = async () => {
    try {
      setIsMarkingLoading(true);
      await dispatch(setReportViewDone({reportId: reportId as string})).unwrap()
      router.push("/admin/reports")
    } catch (error) {
      console.error("Failed to mark as reviewed:", error);
    } finally {
      setIsMarkingLoading(false);
    }
  };

  if (reportLoading || !report?.report) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">
          {t.adminReport.loadingDetails}
        </p>
      </div>
    );
  }

  const { report: reportData, reporterHistory, reportedUserHistory } = report;

  return (
    <div className="relative min-h-screen w-full bg-slate-50 text-slate-800 pb-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-100/60 via-slate-50 to-slate-100 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-150 h-75 bg-emerald-200/30 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 z-10">
        
        {/* Report Details Header */}
        <div className="mb-8 bg-white/80 border border-slate-200/80 backdrop-blur-md rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <ShieldAlert size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t.adminReport.reportId}: #{reportData._id}
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {reportData.topic}
                </h1>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                reportData.isReviewed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {reportData.isReviewed ? (
                <>
                  <CheckCircle2 size={13} /> {t.adminReport.reviewed}
                </>
              ) : (
                <>
                  <Clock size={13} /> {t.adminReport.pendingReview}
                </>
              )}
            </span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {t.adminReport.description}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 whitespace-pre-wrap">
              {reportData.description}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Calendar size={14} />
            <span>
              {t.adminReport.submittedOn}:{" "}
              {new Date(reportData.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Reported User */}
          <div className="bg-white/80 border border-rose-100 backdrop-blur-md rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertOctagon size={13} /> {t.adminReport.reportedTarget}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{reportData.reportedUserId?._id?.slice(-6)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {reportData.reportedUserId?.name || t.adminReport.unknownUser}
                </h3>
                {reportData.reportedUserId?.email && (
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Mail size={13} /> {reportData.reportedUserId.email}
                  </p>
                )}
                {reportData.reportedUserId?.phoneNumber && (
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Phone size={13} /> {reportData.reportedUserId.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() =>
                  openDeleteModal(
                    reportData.reportedUserId._id,
                    reportData.reportedUserId.name || t.adminReport.unknownUser,
                    "reportedUser"
                  )
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-2.5 text-xs font-semibold transition"
              >
                <UserX size={14} />
                <span>{t.adminReport.removeReportedUser}</span>
              </button>
            </div>
          </div>

          {/* Reporter */}
          <div className="bg-white/80 border border-slate-200/80 backdrop-blur-md rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <UserCheck size={13} /> {t.adminReport.reporter}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{reportData.reporterId?._id?.slice(-6)}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {reportData.reporterId?.name || t.adminReport.unknownReporter}
                </h3>
                {reportData.reporterId?.email && (
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Mail size={13} /> {reportData.reporterId.email}
                  </p>
                )}
                {reportData.reporterId?.phoneNumber && (
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Phone size={13} /> {reportData.reporterId.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() =>
                  openDeleteModal(
                    reportData.reporterId._id,
                    reportData.reporterId.name || t.adminReport.unknownReporter,
                    "reporter"
                  )
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white py-2.5 text-xs font-semibold transition"
              >
                <UserX size={14} />
                <span>{t.adminReport.removeReporter}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white/90 border border-emerald-100 backdrop-blur-md rounded-3xl p-6 shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {t.adminReport.adminReviewActions}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.adminReport.adminActionsDesc}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowWarningModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition"
            >
              <AlertTriangle size={15} />
              <span>{t.adminReport.sendWarning}</span>
            </button>

            <button
              onClick={handleMarkAsReviewed}
              disabled={isMarkingLoading || reportData.isReviewed}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {isMarkingLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              <span>
                {reportData.isReviewed
                  ? t.adminReport.alreadyReviewed
                  : t.adminReport.markAsDone}
              </span>
            </button>
          </div>
        </div>

        {/* Histories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/80 border border-slate-200/80 backdrop-blur-md rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <History size={18} className="text-rose-500" />
              <h4 className="text-sm font-bold text-slate-900">
                {t.adminReport.reportedUserHistory} ({reportedUserHistory.length})
              </h4>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {reportedUserHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {t.adminReport.noOffenses}
                </p>
              ) : (
                reportedUserHistory.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.topic}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        item.isReviewed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.isReviewed
                        ? t.adminReport.resolved
                        : t.adminReport.pending}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/80 border border-slate-200/80 backdrop-blur-md rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">
                {t.adminReport.reporterHistory} ({reporterHistory.length})
              </h4>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {reporterHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  {t.adminReport.noSubmissions}
                </p>
              ) : (
                reporterHistory.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{item.topic}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        item.isReviewed
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.isReviewed
                        ? t.adminReport.resolved
                        : t.adminReport.pending}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Confirmation Modal */}
      <AnimatePresence>
        {showWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWarningModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl z-10 border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t.adminReport.sendWarningTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t.adminReport.sendWarningDesc}{" "}
                  <strong className="text-slate-800">
                    {reportData.reportedUserId?.name}
                  </strong>{" "}
                  {t.adminReport.sendWarningSuffix}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowWarningModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  {t.adminReport.cancel}
                </button>
                <button
                  onClick={handleSendWarning}
                  disabled={isWarningLoading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
                >
                  {isWarningLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span>{t.adminReport.confirmAndSend}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl z-10 border border-slate-100"
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                  <UserX size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t.adminReport.removeUserTitle} (
                  {
                    t.adminReport[
                      deleteTarget.userRoleKey === "reporter"
                        ? "reporterRole"
                        : "reportedUserRole"
                    ]
                  }
                  )
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t.adminReport.removeUserDesc}{" "}
                  <strong className="text-slate-800">
                    {deleteTarget.userName}
                  </strong>
                  {t.adminReport.removeUserSuffix}
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.adminReport.reasonLabel} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder={t.adminReport.reasonPlaceholder}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none bg-slate-50"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                >
                  {t.adminReport.cancel}
                </button>
                <button
                  onClick={handleConfirmRemoveUser}
                  disabled={isDeletingLoading || !deleteReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeletingLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span>{t.adminReport.confirmRemoval}</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}