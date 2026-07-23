"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  MapPin,
  User,
  Phone,
  Edit3,
  Trash2,
  AlertTriangle,
  Gavel,
  CheckCircle2,
  Calendar,
  Clock,
  X,
  Radio,
  Award,
  ArrowLeft,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AppDispatch, RootState } from "@/store/store";
import { acceptBid, addBid, deleteProduct, getProduct } from "@/store/slice/productSlice";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductDetailPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { productId } = useParams();
  const { t } = useLanguage();

  // Auth User Redux State
  const { user } = useSelector((state: RootState) => state.auth);
  const { product: productData, productLoading } = useSelector(
    (state: RootState) => state.product
  );

  // 🟢 UI Flickering Fix: Track first fetch status
  const [isFetched, setIsFetched] = useState(false);

  // Modals Local State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const [selectingWinnerId, setSelectingWinnerId] = useState<string | null>(null);

  useEffect(() => {
    if (productId) {
      dispatch(getProduct({ productId: productId as string })).finally(() => {
        setIsFetched(true);
      });
    }
  }, [dispatch, productId]);

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteProduct({ productId: productData?.product._id as string })).unwrap()
      setIsDeleteModalOpen(false);
      router.push("/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Submit Bid (Aratdar)
  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || Number(bidAmount) <= 0) return;

    try {
      setIsSubmittingBid(true);
      await dispatch(addBid({ auctionId: productData?.auction._id as string, bidAmount })).unwrap()
      setIsBidModalOpen(false);
      setBidAmount("");
    } catch (error) {
      console.error("Failed to place bid:", error);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Handle Select Winner (Farmer)
  const handleSelectWinner = async (bidId: string) => {
    try {
      setSelectingWinnerId(bidId);
      await dispatch(acceptBid({ auctionId: productData?.auction._id as string, bidId: bidId as string })).unwrap()
    } catch (error) {
      console.error("Failed to select winner:", error);
    } finally {
      setSelectingWinnerId(null);
    }
  };

  // 🟢 ১. প্রথমবার ফ্যাচ হওয়া পর্যন্ত অথবা লোডিং চলাকালীন শাইন স্পিনার দেখাবে
  if (!isFetched || productLoading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <Sparkles className="absolute text-emerald-600 animate-pulse" size={18} />
          </div>
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {t.productDetail.loading}
          </p>
        </div>
      </div>
    );
  }

  // 🟢 ২. ফ্যাচ শেষ হওয়ার পর যদি ডাটা না থাকে বা এরর হয়, কেবল তখনই নট ফাউন্ড দেখাবে
  if (isFetched && !productData) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-md w-full space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              প্রোডাক্ট পাওয়া যায়নি!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              আপনার খোঁজা পণ্যটি সরিয়ে ফেলা হয়েছে অথবা কোনো যান্ত্রিক ত্রুটি ঘটেছে।
            </p>
          </div>
          <button
            onClick={() => router.push("/products")}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>সব পণ্য তালিকায় ফিরে যান</span>
          </button>
        </div>
      </div>
    );
  }

  // 🛠️ TypeScript Fix: Optional Chaining & Cast for winner & safe extraction
  const winner = (productData as any)?.winner;
  const product = (productData as any)?.product;
  const auction = (productData as any)?.auction;
  const topBids = (productData as any)?.topBids;

  // Safe Extract Farmer ID
  const farmerId =
    typeof product.farmerId === "object"
      ? product.farmerId._id
      : product.farmerId;

  // Conditions
  const isOwner = user ? user._id === farmerId : false;
  const isAratdar = user ? user.role === "aratdar" : false;
  const hasBids = topBids.length > 0;

  const isAuctionEnded = auction?.endTime
    ? new Date(auction.endTime).getTime() < Date.now()
    : false;

  // ১. ১২ ঘণ্টা পার হয়েছে কিনা চেক করার লজিক (auction.selectedAt থেকে)
  const selectedTime = auction?.selectedAt ? new Date(auction.selectedAt).getTime() : 0;
  const is12HoursPassed = selectedTime ? Date.now() > selectedTime + 12 * 60 * 60 * 1000 : false;

  // ২. অর্ডার তৈরি হয়নি এমন অবস্থা
  const isOrderNotCreated = auction?.status !== "ORDER_CREATED";

  const canSelectWinner =
    isOwner &&
    isAuctionEnded &&
    isOrderNotCreated &&
    (!auction?.selectedAt || is12HoursPassed);


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>ফিরে যান</span>
          </button>

          {/* Owner Actions */}
          <div className="flex items-center gap-2">
            {isOwner && !hasBids && (
              <>
                <Link
                  href={`/products/edit/${product._id}`}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-sm"
                >
                  <Edit3 size={15} />
                  <span>{t.productDetail.edit}</span>
                </Link>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-semibold text-xs px-3.5 py-2 rounded-xl transition shadow-sm"
                >
                  <Trash2 size={15} />
                  <span>{t.productDetail.delete}</span>
                </button>
              </>
            )}

            {isAratdar && !isAuctionEnded && (
              <button
                onClick={() => setIsBidModalOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition"
              >
                <Gavel size={16} />
                <span>{t.productDetail.placeBid}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Details Panel */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="relative h-80 sm:h-105 w-full bg-slate-100">
                {product.image?.url ? (
                  <img
                    src={product.image.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                    <Package size={56} />
                    <span className="text-xs font-medium">ছবি পাওয়া যায়নি</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-white/90 backdrop-blur-md text-slate-800 font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {product.name}
                  </h1>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin size={14} className="text-emerald-600" /> {product.district}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">
                      {t.productDetail.quantity}
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {product.quantity} {product.unit}
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/60">
                    <p className="text-[11px] text-emerald-600 font-semibold uppercase">
                      {t.productDetail.pricePerUnit}
                    </p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">
                      ৳{product.pricePerUnit}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">
                      {t.productDetail.harvestDate}
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(product.harvestDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {product.description && (
                  <div className="space-y-2 border-t border-slate-100 pt-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t.productDetail.description}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Farmer Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase">
                    {t.productDetail.farmerInfo}
                  </p>
                  <h4 className="text-sm font-bold text-slate-800">
                    {typeof product.farmerId === "object" ? product.farmerId.name : "N/A"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {typeof product.farmerId === "object" ? product.farmerId.district : ""}
                  </p>
                </div>
              </div>

              {typeof product.farmerId === "object" && (
                <a
                  href={`tel:${product.farmerId.phoneNumber}`}
                  className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 rounded-2xl border border-slate-100 transition"
                >
                  <Phone size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Right Auction Panel */}
          <div className="lg:col-span-5 space-y-6">

            {/* Live Auction Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    {t.productDetail.liveAuction}
                  </h3>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${isAuctionEnded
                    ? "bg-rose-50 text-rose-600"
                    : "bg-emerald-50 text-emerald-700"
                    }`}
                >
                  {isAuctionEnded ? t.productDetail.auctionEnded : auction?.status || "ACTIVE"}
                </span>
              </div>

              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                  <span>{t.productDetail.startPrice}:</span>
                  <span className="font-bold text-slate-200">৳{auction?.startPrice || 0}</span>
                </div>

                <div className="flex justify-between items-baseline border-t border-slate-800 pt-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {t.productDetail.highestBid}:
                  </span>
                  <span className="text-2xl font-black text-emerald-400 flex items-center gap-1">
                    <TrendingUp size={20} />
                    ৳{auction?.currentHighestBid || auction?.startPrice || 0}
                  </span>
                </div>

                {/* 🟢 END TIME DISPLAY ADDED HERE */}
                {auction?.endTime && (
                  <div className="flex justify-between items-center border-t border-slate-800/80 pt-3 text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <Clock size={13} className="text-amber-400" />
                      <span>{t.productDetail.auctionEndTime}</span>
                    </span>
                    <span className="font-bold text-amber-300">
                      {new Date(auction.endTime).toLocaleString(t.productDetail.locale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bids Leaderboard */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Gavel size={16} className="text-emerald-600" />
                  <span>{t.productDetail.topBids}</span>
                </h3>
                <span className="text-xs text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                  {topBids.length} {t.productDetail.bidsCount}
                </span>
              </div>

              {!hasBids ? (
                <div className="py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Radio size={24} className="mx-auto text-slate-300 mb-2 animate-pulse" />
                  <p className="text-xs font-medium text-slate-400">
                    {t.productDetail.noBids}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {topBids.map((bid: any, index: number) => {
                    const aratdar = typeof bid.aratdarId === "object" ? bid.aratdarId : {};
                    const aratdarName = aratdar.name || "Aratdar";
                    const aratdarPhone = aratdar.phoneNumber || "N/A";
                    const aratdarDistrict = aratdar.district || "";

                    return (
                      <div
                        key={bid._id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${index === 0
                          ? "bg-emerald-50/40 border-emerald-200/80"
                          : "bg-slate-50/60 border-slate-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-lg text-[11px] font-extrabold flex items-center justify-center ${index === 0
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-600"
                              }`}
                          >
                            #{index + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">
                              {aratdarName}
                            </p>

                            {/* Owner হলে ফোন নম্বর ও জেলা দেখাবে */}
                            {isOwner && (
                              <p className="text-[11px] font-medium text-emerald-700">
                                📞 {aratdarPhone} {aratdarDistrict && `| 📍 ${aratdarDistrict}`}
                              </p>
                            )}

                            <p className="text-[10px] text-slate-400">
                              {new Date(bid.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-xs sm:text-sm">
                            ৳{bid.bidAmount}
                          </span>

                          {/* Set Winner Button */}
                          {canSelectWinner && (
                            <button
                              disabled={selectingWinnerId === bid._id}
                              onClick={() => handleSelectWinner(bid._id)}
                              className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg transition disabled:opacity-50 shadow-sm"
                            >
                              <Award size={12} />
                              <span>
                                {selectingWinnerId === bid._id
                                  ? t.productDetail.selecting
                                  : t.productDetail.selectWinner}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {winner && (
              <div className="bg-linear-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-200" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    {t.productDetail.winner}
                  </h4>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-base font-extrabold">{winner.aratdar?.name || "N/A"}</p>
                    <p className="text-xs text-emerald-100">{winner.aratdar?.phoneNumber || ""}</p>
                  </div>
                  <span className="text-xl font-black bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl">
                    ৳{winner.bidAmount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle size={20} />
                  <h3 className="font-bold text-slate-800 text-sm">
                    {t.productDetail.deleteModalTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                {t.productDetail.deleteModalDesc}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs transition"
                >
                  {t.productDetail.cancel}
                </button>

                <button
                  disabled={isDeleting}
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
                >
                  {isDeleting
                    ? t.productDetail.deleting
                    : t.productDetail.confirmDelete}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bid Modal */}
      <AnimatePresence>
        {isBidModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Gavel size={20} />
                  <h3 className="font-bold text-slate-800 text-sm">
                    {t.productDetail.bidModalTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setIsBidModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    {t.productDetail.enterBidAmount}
                  </label>
                  <input
                    type="number"
                    min={(auction?.currentHighestBid || auction?.startPrice || 0) + 1}
                    required
                    value={bidAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBidAmount(val === "" ? "" : Number(val));
                    }}
                    placeholder={t.productDetail.bidAmountPlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 text-sm"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t.productDetail.highestBid}: ৳
                    {auction?.currentHighestBid || auction?.startPrice || 0}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBidModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs transition"
                  >
                    {t.productDetail.cancel}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingBid}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isSubmittingBid
                      ? t.productDetail.submitting
                      : t.productDetail.submitBid}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}