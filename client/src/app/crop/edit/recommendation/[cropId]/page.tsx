"use client"

import { getCropDetails } from '@/store/slice/cropSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CropRecommendationForm from '@/components/crop/CropRecommendationForm'
import { Sprout, SearchX, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const translations = {
    en: {
        loading: "Loading crop details...",
        notFoundTitle: "Crop Not Found",
        notFoundDesc: "This crop may have been removed, or the link you followed is incorrect.",
        backButton: "Back to Crop List",
        backToCrop: "Back to Crop Details",
        createTitle: "Add Recommendation",
        editTitle: "Edit Recommendation",
    },
    bn: {
        loading: "ফসলের তথ্য লোড হচ্ছে...",
        notFoundTitle: "ফসল খুঁজে পাওয়া যায়নি",
        notFoundDesc: "এই ফসলটি হয়তো মুছে ফেলা হয়েছে, অথবা আপনি যে লিংকে ক্লিক করেছেন তা সঠিক নয়।",
        backButton: "ফসলের তালিকায় ফিরে যান",
        backToCrop: "ফসলের বিস্তারিতে ফিরে যান",
        createTitle: "নতুন সুপারিশ যুক্ত করুন",
        editTitle: "সুপারিশ সম্পাদনা করুন",
    },
}

const CropRecommendationEditPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { cropDetails, cropLoading } = useSelector((state: RootState) => state.crop)
    const { cropId } = useParams()
    const router = useRouter()
    const [notFound, setNotFound] = useState(false)
    const { locale } = useLanguage()
    const t = translations[locale === 'bn' ? 'bn' : 'en']

    useEffect(() => {
        const fetch = async () => {
            try {
                setNotFound(false)
                await dispatch(getCropDetails({ cropId: cropId as string })).unwrap()
            } catch (error) {
                console.error(error)
                setNotFound(true)
            }
        }
        if (cropDetails.crop?._id !== cropId) {
            fetch()
        }
    }, [cropId, dispatch, cropDetails.crop?._id])

    // ---------- Crop Not Found state ----------
    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#F5F6F1] to-[#E8EDE1] px-4">
                <div className="text-center max-w-sm">
                    <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-[pop_0.4s_ease-out]">
                        <SearchX className="w-10 h-10 text-green-700" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        {t.notFoundTitle}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {t.notFoundDesc}
                    </p>
                    <button
                        onClick={() => router.push('/crop')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors shadow-sm cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.backButton}
                    </button>
                </div>

                <style jsx>{`
                    @keyframes pop {
                        0% { transform: scale(0.6); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        )
    }

    // ---------- Loading state ----------
    if (cropLoading || cropDetails.crop?._id !== cropId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#F5F6F1] to-[#E8EDE1]">
                <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-5">
                        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
                        <Sprout className="absolute inset-0 m-auto w-6 h-6 text-green-700 animate-pulse" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-green-800 font-medium tracking-wide animate-pulse">
                        {t.loading}
                    </p>
                </div>
            </div>
        )
    }

    const hasRecommendation = Boolean(cropDetails.recommendation)

    return (
        <div className="min-h-screen bg-[#F5F6F1] py-10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => router.push(`/crop/${cropId}`)}
                        className="inline-flex items-center gap-2 text-sm text-[#3E5241] hover:text-[#1E3A2B] font-medium transition cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.backToCrop}
                    </button>
                    <h1 className="text-lg font-medium text-[#16241A]">
                        {hasRecommendation ? t.editTitle : t.createTitle}
                    </h1>
                </div>

                {/* Recommendation Form Container */}
                <CropRecommendationForm
                    mode={hasRecommendation ? 'edit' : 'create'}
                    cropId={cropId as string}
                    cropRecommendationId={cropDetails.recommendation?._id}
                    defaultValues={cropDetails.recommendation || null}
                    onSuccess={() => router.push(`/crop/${cropId}`)}
                />
            </div>
        </div>
    )
}

export default CropRecommendationEditPage