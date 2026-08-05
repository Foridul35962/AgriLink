"use client"

import { useLanguage } from '@/context/LanguageContext'
import { getCropDetails, deleteCrop, deleteRecommendation } from '@/store/slice/cropSlice'
import { AppDispatch, RootState } from '@/store/store'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    Sprout,
    SearchX,
    Pencil,
    Plus,
    Droplet,
    Calendar,
    Thermometer,
    CloudRain,
    Wind,
    Layers,
    Lightbulb,
    MapPin,
    ClipboardList,
    Trash2,
} from 'lucide-react'
import { DISTRICTS_BN, MONTHS } from '@/constants/constantValues'

const CropDetailsPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const { cropDetails, cropLoading } = useSelector((state: RootState) => state.crop)
    const { user } = useSelector((state: RootState) => state.auth)
    const { t, locale } = useLanguage()
    const { cropId } = useParams()
    const [notFound, setNotFound] = useState(false)

    // Delete modal states
    const [deleteModalType, setDeleteModalType] = useState<'crop' | 'recommendation' | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const isAdmin = user?.role === 'admin'

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
    }, [cropId])

    const waterColor = {
        low: 'bg-blue-50 text-blue-600',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-blue-200 text-blue-800',
    }

    // month number (1-12) -> label, MONTHS constant theke
    const getMonthLabel = (monthValue: number) => {
        const month = MONTHS.find((m) => m.value === monthValue)
        if (!month) return monthValue
        return locale === 'bn' ? month.labelBn : month.labelEn
    }

    // district name (English, DB e jeভাবে stored) -> locale onujayi label
    const getDistrictLabel = (district: string) => {
        return locale === 'bn' ? (DISTRICTS_BN[district] ?? district) : district
    }

    // ---------- Delete Handler ----------
    const handleDeleteConfirm = async () => {
        if (!deleteModalType || !cropId) return
        try {
            setIsDeleting(true)
            if (deleteModalType === 'crop') {
                await dispatch(deleteCrop({ cropId: cropId as string })).unwrap()
                setDeleteModalType(null)
                router.push('/crop')
            } else if (deleteModalType === 'recommendation') {
                await dispatch(deleteRecommendation({ cropRecommendationId: cropDetails.recommendation?._id as string })).unwrap()
                setDeleteModalType(null)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsDeleting(false)
        }
    }

    // ---------- Loading state ----------
    if (cropLoading || (cropDetails.crop?._id !== cropId && !notFound)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#F5F6F1] to-[#E8EDE1]">
                <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16 mb-5">
                        <div className="absolute inset-0 rounded-full border-4 border-green-100" />
                        <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
                        <Sprout className="absolute inset-0 m-auto w-6 h-6 text-green-700 animate-pulse" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-green-800 font-medium tracking-wide animate-pulse">
                        {t.cropDetailsPage.loading}
                    </p>
                </div>
            </div>
        )
    }

    // ---------- Not Found state ----------
    if (notFound || !cropDetails.crop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#F5F6F1] to-[#E8EDE1] px-4">
                <div className="text-center max-w-sm">
                    <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-[pop_0.4s_ease-out]">
                        <SearchX className="w-10 h-10 text-green-700" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                        {t.cropDetailsPage.notFoundTitle}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        {t.cropDetailsPage.notFoundDesc}
                    </p>
                    <Link
                        href="/crop"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors shadow-sm"
                    >
                        {t.cropDetailsPage.backButton}
                    </Link>
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

    const crop = cropDetails.crop
    const recommendation = cropDetails.recommendation
    const displayName = locale === 'bn' ? crop.banglaName : crop.name
    const secondaryName = locale === 'bn' ? crop.name : crop.banglaName

    return (
        <div className="min-h-screen bg-[#F5F6F1]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ---------- Header / Crop Card ---------- */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                    <div className="relative w-full h-56 bg-green-50">
                        {crop.image?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={crop.image.url}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Sprout className="w-14 h-14 text-green-300" strokeWidth={1} />
                            </div>
                        )}
                        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-green-800 shadow-sm">
                            {t.cropDetailsPage.categories[crop.category]}
                        </span>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-800">{displayName}</h1>
                                {secondaryName && (
                                    <p className="text-sm text-gray-400 mt-0.5">{secondaryName}</p>
                                )}
                            </div>

                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/crop/edit/details/${cropId}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-green-200 text-green-700 text-sm font-medium hover:bg-green-50 transition-colors"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        {t.cropDetailsPage.editCrop}
                                    </Link>
                                    <button
                                        onClick={() => setDeleteModalType('crop')}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        {locale === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {crop.description && (
                            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                                {crop.description}
                            </p>
                        )}

                        {/* ---------- Quick stats ---------- */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                            {crop.waterRequirement && (
                                <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${waterColor[crop.waterRequirement]}`}>
                                    <Droplet className="w-4 h-4 shrink-0" />
                                    <div>
                                        <p className="text-[11px] opacity-70">{t.cropDetailsPage.waterRequirement}</p>
                                        <p className="text-sm font-medium">{t.cropDetailsPage.water[crop.waterRequirement]}</p>
                                    </div>
                                </div>
                            )}

                            {crop.cultivationDuration !== undefined && (
                                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-amber-50 text-amber-700">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    <div>
                                        <p className="text-[11px] opacity-70">{t.cropDetailsPage.cultivationDuration}</p>
                                        <p className="text-sm font-medium">
                                            {crop.cultivationDuration} {t.cropDetailsPage.days}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ---------- Suitable Soil ---------- */}
                        {crop.suitableSoil && crop.suitableSoil.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Layers className="w-4 h-4 text-green-700" />
                                    {t.cropDetailsPage.suitableSoil}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {crop.suitableSoil.map((soil, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                            {soil}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ---------- Cultivation Tips ---------- */}
                        {crop.cultivationTips && crop.cultivationTips.length > 0 && (
                            <div className="mt-6">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Lightbulb className="w-4 h-4 text-green-700" />
                                    {t.cropDetailsPage.cultivationTips}
                                </div>
                                <ul className="space-y-1.5">
                                    {crop.cultivationTips.map((tip, i) => (
                                        <li key={i} className="text-sm text-gray-600 flex gap-2">
                                            <span className="text-green-600">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* ---------- Weather Requirement ---------- */}
                        {crop.weatherRequirement && (
                            <div className="mt-6">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Wind className="w-4 h-4 text-green-700" />
                                    {t.cropDetailsPage.weatherRequirement}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {(crop.weatherRequirement.minTemperature !== undefined ||
                                        crop.weatherRequirement.maxTemperature !== undefined) && (
                                            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                                <Thermometer className="w-4 h-4 text-gray-500 mb-1" />
                                                <p className="text-[11px] text-gray-400">{t.cropDetailsPage.temperature}</p>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {crop.weatherRequirement.minTemperature ?? '—'}° - {crop.weatherRequirement.maxTemperature ?? '—'}°C
                                                </p>
                                            </div>
                                        )}
                                    {(crop.weatherRequirement.minHumidity !== undefined ||
                                        crop.weatherRequirement.maxHumidity !== undefined) && (
                                            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                                <Droplet className="w-4 h-4 text-gray-500 mb-1" />
                                                <p className="text-[11px] text-gray-400">{t.cropDetailsPage.humidity}</p>
                                                <p className="text-sm font-medium text-gray-700">
                                                    {crop.weatherRequirement.maxHumidity ?? '—'}%
                                                </p>
                                            </div>
                                        )}
                                    {crop.weatherRequirement.maxRainProbability !== undefined && (
                                        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                            <CloudRain className="w-4 h-4 text-gray-500 mb-1" />
                                            <p className="text-[11px] text-gray-400">{t.cropDetailsPage.rainProbability}</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                ≤ {crop.weatherRequirement.maxRainProbability}%
                                            </p>
                                        </div>
                                    )}
                                    {crop.weatherRequirement.maxRainfall !== undefined && (
                                        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                            <CloudRain className="w-4 h-4 text-gray-500 mb-1" />
                                            <p className="text-[11px] text-gray-400">{t.cropDetailsPage.rainfall}</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                ≤ {crop.weatherRequirement.maxRainfall}mm
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ---------- Recommendation Card ---------- */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                            <div className="flex items-center gap-2 text-base font-semibold text-gray-800">
                                <ClipboardList className="w-4.5 h-4.5 text-green-700" />
                                {t.cropDetailsPage.recommendationTitle}
                            </div>

                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/crop/edit/recommendation/${cropId}`}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors shadow-sm"
                                    >
                                        {recommendation ? (
                                            <>
                                                <Pencil className="w-3.5 h-3.5" />
                                                {t.cropDetailsPage.editRecommendation}
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5" />
                                                {t.cropDetailsPage.addRecommendation}
                                            </>
                                        )}
                                    </Link>
                                    {recommendation && (
                                        <button
                                            onClick={() => setDeleteModalType('recommendation')}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            {locale === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {!recommendation ? (
                            <div className="text-center py-8">
                                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                                    <ClipboardList className="w-6 h-6 text-green-400" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-medium text-gray-700">
                                    {t.cropDetailsPage.noRecommendationTitle}
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {t.cropDetailsPage.noRecommendationDesc}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                        <p className="text-[11px] text-gray-400">{t.cropDetailsPage.season}</p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {t.cropDetailsPage.seasons[recommendation.season]}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                        <p className="text-[11px] text-gray-400">{t.cropDetailsPage.plantingMonths}</p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {recommendation.plantingMonths.map(getMonthLabel).join(', ')}
                                        </p>
                                    </div>
                                </div>

                                {recommendation.districts?.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <MapPin className="w-4 h-4 text-green-700" />
                                            {t.cropDetailsPage.districts}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recommendation.districts.map((d, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                                    {getDistrictLabel(d)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {recommendation.reason && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">{t.cropDetailsPage.reason}</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">{recommendation.reason}</p>
                                    </div>
                                )}

                                {recommendation.tips && recommendation.tips.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                            <Lightbulb className="w-4 h-4 text-green-700" />
                                            {t.cropDetailsPage.tips}
                                        </div>
                                        <ul className="space-y-1.5">
                                            {recommendation.tips.map((tip, i) => (
                                                <li key={i} className="text-sm text-gray-600 flex gap-2">
                                                    <span className="text-green-600">•</span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ---------- Delete Confirmation Modal ---------- */}
            {deleteModalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-[pop_0.2s_ease-out]">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {locale === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {deleteModalType === 'crop'
                                ? (locale === 'bn' ? 'এই ফসলটি মুছে ফেলা হলে এটি আর ফিরে পাওয়া যাবে না।' : 'Deleting this crop will permanently remove it from the system.')
                                : (locale === 'bn' ? 'এই সুপারিশটি মুছে ফেলা হলে এটি আর ফিরে পাওয়া যাবে না।' : 'Deleting this recommendation will permanently remove it.')}
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                disabled={isDeleting}
                                onClick={() => setDeleteModalType(null)}
                                className="px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {locale === 'bn' ? 'বাতিল' : 'Cancel'}
                            </button>
                            <button
                                disabled={isDeleting}
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 rounded-full bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                {isDeleting
                                    ? (locale === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...')
                                    : (locale === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'OK')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CropDetailsPage