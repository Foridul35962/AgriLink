"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  UserX,
  FileText,
  AlignLeft,
  Send,
  Loader2,
  CheckCircle2,
  X,
  RotateCcw,
} from "lucide-react";

import { AppDispatch, RootState } from "@/store/store";
import { useLanguage } from "@/context/LanguageContext";
import { createReport } from "@/store/slice/reportSlice";
import { createReportType } from "@/types/reportTypes";

const MIN_TOPIC_LENGTH = 10;
const MAX_TOPIC_LENGTH = 50;

const MIN_DESC_LENGTH = 50;
const MAX_DESC_LENGTH = 300;

export default function CreateReportPage() {
  const { reportedUserId } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useLanguage();

  const { reportLoading } = useSelector((state: RootState) => state.report);

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ topic?: string; description?: string }>({});

  // Success Modal State & Submitted Data Backup
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<createReportType | null>(null);

  const validateForm = () => {
    const newErrors: { topic?: string; description?: string } = {};

    // Topic Validation
    if (!topic.trim()) {
      newErrors.topic =
        t.createReport?.messages?.topicRequired || "Topic is required";
    } else if (
      topic.trim().length < MIN_TOPIC_LENGTH ||
      topic.trim().length > MAX_TOPIC_LENGTH
    ) {
      newErrors.topic =
        t.createReport?.messages?.topicLength ||
        `Topic must be between ${MIN_TOPIC_LENGTH} and ${MAX_TOPIC_LENGTH} characters`;
    }

    // Description Validation
    if (!description.trim()) {
      newErrors.description =
        t.createReport?.messages?.descriptionRequired ||
        "Description is required";
    } else if (
      description.trim().length < MIN_DESC_LENGTH ||
      description.trim().length > MAX_DESC_LENGTH
    ) {
      newErrors.description =
        t.createReport?.messages?.descriptionLength ||
        `Description must be between ${MIN_DESC_LENGTH} and ${MAX_DESC_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload: createReportType = {
      reportedUserId: (reportedUserId as string) || "",
      topic: topic.trim(),
      description: description.trim(),
    };

    try {
      await dispatch(createReport(payload)).unwrap();
      setSubmittedData(payload);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        description:
          error?.message ||
          t.createReport?.messages?.error ||
          "Failed to submit report. Please try again.",
      }));
    }
  };

  const handleResetForm = () => {
    setTopic("");
    setDescription("");
    setErrors({});
    setIsSuccessModalOpen(false);
    setSubmittedData(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      {/* Background Gradients & Emerald Glassmorphism Aesthetics */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-100/60 via-slate-50 to-slate-100 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-125 h-75 bg-emerald-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.06] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12 z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 border border-emerald-200/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-3 shadow-sm">
            <ShieldAlert size={14} className="text-emerald-700" />
            {t.createReport?.badge || "Report System"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t.createReport?.title || "Submit a Report"}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            {t.createReport?.subtitle ||
              "Please provide details about the issue or violation you encountered."}
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-xl p-6 sm:p-8 space-y-6"
        >
          {/* Target Reported User ID */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200/70 flex items-center justify-center text-emerald-700 shrink-0">
                <UserX size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t.createReport?.fields?.reportedUser?.label ||
                    "Reported User ID"}
                </p>
                <p className="text-sm font-mono font-bold text-slate-800">
                  #{reportedUserId}
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200/80">
              Target
            </span>
          </div>

          {/* Topic Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="topic"
                className="block text-sm font-semibold text-slate-700"
              >
                {t.createReport?.fields?.topic?.label || "Report Topic / Reason"}
              </label>
              <span
                className={`text-xs ${
                  topic.length > MAX_TOPIC_LENGTH
                    ? "text-rose-500 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {topic.length}/{MAX_TOPIC_LENGTH}
              </span>
            </div>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                id="topic"
                type="text"
                maxLength={MAX_TOPIC_LENGTH}
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (errors.topic)
                    setErrors((prev) => ({ ...prev, topic: undefined }));
                }}
                placeholder={
                  t.createReport?.fields?.topic?.placeholder ||
                  "e.g., Inappropriate behavior on profile"
                }
                className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                  errors.topic
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
            </div>
            {errors.topic && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.topic}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700"
              >
                {t.createReport?.fields?.description?.label ||
                  "Detailed Description"}
              </label>
              <span
                className={`text-xs ${
                  description.length > MAX_DESC_LENGTH
                    ? "text-rose-500 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {description.length}/{MAX_DESC_LENGTH}
              </span>
            </div>
            <div className="relative">
              <AlignLeft
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none"
              />
              <textarea
                id="description"
                rows={5}
                maxLength={MAX_DESC_LENGTH}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                placeholder={
                  t.createReport?.fields?.description?.placeholder ||
                  "Explain the issue in detail (at least 50 characters)..."
                }
                className={`w-full resize-none rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                  errors.description
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">
                {errors.description}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={reportLoading}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reportLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>
                  {t.createReport?.buttons?.submitting || "Submitting..."}
                </span>
              </>
            ) : (
              <>
                <span>
                  {t.createReport?.buttons?.submit || "Submit Report"}
                </span>
                <Send size={15} />
              </>
            )}
          </motion.button>
        </motion.form>
      </div>

      {/* Success Details Menu / Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && submittedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg rounded-3xl border border-emerald-100 bg-white/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>

              {/* Success Badge & Icon */}
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Report Submitted Successfully!
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Thank you for keeping our platform safe. Here are the details of your report:
                </p>
              </div>

              {/* Details Content Box */}
              <div className="mt-6 space-y-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 text-left">
                {/* User ID */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Reported User ID
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">
                    #{submittedData.reportedUserId}
                  </p>
                </div>

                {/* Topic */}
                <div className="border-t border-slate-200/60 pt-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Topic / Reason
                  </span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {submittedData.topic}
                  </p>
                </div>

                {/* Description */}
                <div className="border-t border-slate-200/60 pt-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Description
                  </span>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed bg-white border border-slate-200/60 rounded-xl p-3 max-h-36 overflow-y-auto">
                    {submittedData.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleResetForm}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 text-sm font-semibold transition"
                >
                  <RotateCcw size={15} />
                  <span>Submit Another</span>
                </button>
                <button
                  onClick={() => {setIsSuccessModalOpen(false); handleResetForm()}}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-sm font-semibold shadow-md shadow-emerald-600/20 transition"
                >
                  <span>Close</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}