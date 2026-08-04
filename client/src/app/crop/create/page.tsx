"use client"

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { useLanguage } from '@/context/LanguageContext'
import { Sprout, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CropInfoForm from '@/components/crop/CropInfoForm'
import CropRecommendationForm from '@/components/crop/CropRecommendationForm'

const AddCropPage = () => {
    const { cropDetails } = useSelector((state: RootState) => state.crop)
    const { t, locale } = useLanguage()
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1)

    const handleSkip = () => {
        if (!cropDetails.crop?._id) return
        alert(
            locale === 'bn'
                ? 'সুপারিশ ছাড়াই ফসলটি সফলভাবে যোগ করা হয়েছে।'
                : 'Crop created successfully without recommendation.'
        )
        router.push(`/crop/${cropDetails.crop._id}`)
    }

    return (
        <div className="min-h-screen bg-[#F5F6F1]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <div className="mb-8">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#7A8A72] uppercase mb-1.5">
                        {t?.addCropPage?.eyebrow || 'Crop Registry'}
                    </p>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#16241A] font-medium">
                        {t?.addCropPage?.pageTitle || 'Add a new crop to the registry'}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">

                    <div className="lg:sticky lg:top-10 lg:self-start">
                        <div className="flex lg:flex-col gap-0 bg-white rounded-2xl border border-[#E1E5D8] p-5 lg:p-6 shadow-[0_1px_2px_rgba(22,36,26,0.04)]">
                            <div className="flex-1 lg:flex-none flex lg:block items-start gap-3">
                                <div className="flex lg:flex-row flex-col items-center lg:items-start">
                                    <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${step === 1 ? 'bg-[#1E3A2B] border-[#1E3A2B] text-white' : 'bg-[#EEF1E9] border-[#EEF1E9] text-[#7A8A72]'}`}>
                                        <Sprout size={16} />
                                    </div>
                                    <div className={`hidden lg:block w-0.5 h-10 mx-auto my-1 rounded-full ${step === 2 || cropDetails.crop?._id ? 'bg-[#1E3A2B]' : 'bg-[#E1E5D8]'}`} />
                                </div>
                                <div className="lg:mt-2">
                                    <p className={`text-sm font-semibold ${step === 1 ? 'text-[#16241A]' : 'text-[#8B968A]'}`}>
                                        {t?.addCropPage?.step1Title || 'Basic crop info'}
                                    </p>
                                    <p className="text-xs text-[#8B968A] mt-0.5 hidden lg:block">
                                        {t?.addCropPage?.step1Sub || 'Name, category, image and weather profile'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 lg:flex-none flex lg:block items-start gap-3">
                                <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${step === 2 ? 'bg-[#1E3A2B] border-[#1E3A2B] text-white' : 'bg-[#EEF1E9] border-[#EEF1E9] text-[#7A8A72]'}`}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div className="lg:mt-2">
                                    <p className={`text-sm font-semibold ${step === 2 ? 'text-[#16241A]' : 'text-[#8B968A]'}`}>
                                        {t?.addCropPage?.step2Title || 'Recommendations'}
                                    </p>
                                    <p className="text-xs text-[#8B968A] mt-0.5 hidden lg:block">
                                        {t?.addCropPage?.step2Sub || 'Optional — districts, season and tips'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        {step === 1 && (
                            <CropInfoForm mode="create" onSuccess={() => setStep(2)} />
                        )}
                        {step === 2 && (
                            <CropRecommendationForm
                                mode="create"
                                cropId={cropDetails.crop?._id}
                                onSkip={handleSkip}
                                onSuccess={() => router.push(`/crop/${cropDetails.crop?._id}`)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddCropPage