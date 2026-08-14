"use client"

import { getCropDetails } from '@/store/slice/cropSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CropInfoForm from '@/components/crop/CropInfoForm'
import { Sprout, SearchX, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const translations = {
    en: {
        loading: "Loading crop details...",
        notFoundTitle: "Crop Not Found",
        notFoundDesc: "This crop may have been removed, or the link you followed is incorrect.",
        backButton: "Back to Crop List",
    },
    bn: {
        loading: "ফসলের তথ্য লোড হচ্ছে...",
        notFoundTitle: "ফসল খুঁজে পাওয়া যায়নি",
        notFoundDesc: "এই ফসলটি হয়তো মুছে ফেলা হয়েছে, অথবা আপনি যে লিংকে ক্লিক করেছেন তা সঠিক নয়।",
        backButton: "ফসলের তালিকায় ফিরে যান",
    },
}

const CropEditPage = () => {
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
                console.log(error)
                setNotFound(true)
            }
        }
        if (cropDetails.crop?._id !== cropId) {
            fetch()
        }
    }, [cropId]) // bug fix: age "cropId" string chilo, variable na

    // ---------- Not Found state ----------
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors shadow-sm"
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

    return (
        <div className="min-h-screen bg-[#F5F6F1]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <CropInfoForm
                    mode="edit"
                    cropId={cropId as string}
                    defaultValues={cropDetails.crop}
                    onSuccess={() => router.push(`/crop/${cropId}`)}
                />
            </div>
        </div>
    )
}

export default CropEditPage