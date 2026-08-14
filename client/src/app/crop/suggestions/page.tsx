"use client"

import { useLanguage } from '@/context/LanguageContext'
import { getCropSuggestion } from '@/store/slice/cropSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, useSearchParams } from 'next/navigation'
import { DISTRICTS, DISTRICTS_BN } from '@/constants/constantValues'
import { motion, AnimatePresence } from 'framer-motion'
import {
    MapPin,
    Sprout,
    Cloud,
    Droplets,
    CloudRain,
    Thermometer,
    LogIn,
    Loader2,
    PackageSearch,
    ChevronDown,
    Sparkles,
    Layers,
} from 'lucide-react'
import Link from 'next/link'

const CropSuggestionPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const searchParams = useSearchParams()

    const { user } = useSelector((state: RootState) => state.auth)
    const { cropSuggestion, cropLoading } = useSelector((state: RootState) => state.crop)
    const { t, locale } = useLanguage()

    const districtFromUrl = searchParams.get('district') || ''
    const [selectedDistrict, setSelectedDistrict] = useState<string>('')

    useEffect(() => {
        if (districtFromUrl) {
            setSelectedDistrict(districtFromUrl)
        } else if (user?.district) {
            setSelectedDistrict(user.district)
            const params = new URLSearchParams(searchParams.toString())
            params.set('district', user.district)
            router.replace(`?${params.toString()}`, { scroll: false })
        }
    }, [districtFromUrl, user?.district])

    useEffect(() => {
        if (!selectedDistrict) return
        if (cropSuggestion?.location?.districts === selectedDistrict) return

        const fetchData = async () => {
            if (!DISTRICTS.includes(selectedDistrict)) {
                return
            }
            await dispatch(getCropSuggestion({ districts: selectedDistrict })).unwrap()
        }
        fetchData()
    }, [selectedDistrict, dispatch])

    const handleDistrictChange = (district: string) => {
        setSelectedDistrict(district)
        const params = new URLSearchParams(searchParams.toString())
        params.set('district', district)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const getDistrictLabel = (district: string) => {
        return locale === 'bn' ? (DISTRICTS_BN[district] ?? district) : district
    }

    const showLoginPrompt = !user && !selectedDistrict

    return (
        <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                            <Sprout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                                {t.cropSuggestion.title}
                            </h1>
                            {selectedDistrict && (
                                <p className="text-sm text-emerald-700 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {getDistrictLabel(selectedDistrict)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* District selector */}
                    <div className="relative w-full sm:w-64">
                        <label htmlFor="district-select" className="block text-xs font-medium text-gray-500 mb-1.5">
                            {t.cropSuggestion.selectDistrict}
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 pointer-events-none" />
                            <select
                                id="district-select"
                                value={selectedDistrict}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                className="w-full appearance-none border border-emerald-200 rounded-xl pl-10 pr-9 py-2.5 text-sm bg-white text-gray-800 font-medium shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors cursor-pointer"
                            >
                                <option value="" disabled>
                                    {t.cropSuggestion.selectDistrictLabel}
                                </option>
                                {DISTRICTS.map((district) => (
                                    <option key={district} value={district}>
                                        {getDistrictLabel(district)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* Login / select prompt */}
                    {showLoginPrompt && (
                        <motion.div
                            key="login-prompt"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative overflow-hidden bg-white border border-emerald-100 rounded-3xl px-6 py-16 text-center shadow-sm"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-2xl" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-50 rounded-full blur-2xl" />
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                className="relative w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"
                            >
                                <LogIn className="w-7 h-7 text-emerald-600" />
                            </motion.div>
                            <p className="relative text-gray-600 max-w-sm mx-auto">
                                {t.cropSuggestion.loginPrompt}
                            </p>
                        </motion.div>
                    )}

                    {/* Loading */}
                    {!showLoginPrompt && cropLoading && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24 gap-3 text-emerald-700"
                        >
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-sm font-medium">{t.cropSuggestion.loading}</span>
                        </motion.div>
                    )}

                    {/* Content */}
                    {!showLoginPrompt && !cropLoading && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                        >
                            {/* Weather card */}
                            {cropSuggestion?.weather && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative overflow-hidden bg-linear-to-br from-emerald-600 to-emerald-700 rounded-3xl p-6 mb-8 shadow-xl shadow-emerald-600/20 text-white"
                                >
                                    <Cloud className="absolute -right-4 -top-4 w-32 h-32 text-white/10" />

                                    <div className="relative flex items-center justify-between mb-5">
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <CloudRain className="w-5 h-5" />
                                            {t.cropSuggestion.weatherTitle}
                                        </h2>
                                        <span className="text-sm text-emerald-100">
                                            {cropSuggestion.weather.location.name}
                                        </span>
                                    </div>

                                    <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5">
                                            <Thermometer className="w-4 h-4 text-emerald-100 mb-1.5" />
                                            <p className="text-xs text-emerald-100">{t.cropSuggestion.temperature}</p>
                                            <p className="text-xl font-bold">{cropSuggestion.weather.temperature}°C</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5">
                                            <Droplets className="w-4 h-4 text-emerald-100 mb-1.5" />
                                            <p className="text-xs text-emerald-100">{t.cropSuggestion.humidity}</p>
                                            <p className="text-xl font-bold">{cropSuggestion.weather.humidity}%</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5">
                                            <CloudRain className="w-4 h-4 text-emerald-100 mb-1.5" />
                                            <p className="text-xs text-emerald-100">{t.cropSuggestion.rainProbability}</p>
                                            <p className="text-xl font-bold">{cropSuggestion.weather.rainProbability}%</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5">
                                            <Cloud className="w-4 h-4 text-emerald-100 mb-1.5" />
                                            <p className="text-xs text-emerald-100">{t.cropSuggestion.rainfall}</p>
                                            <p className="text-xl font-bold">{cropSuggestion.weather.rainfall}mm</p>
                                        </div>
                                    </div>

                                    <p className="relative text-sm text-emerald-100 mt-4">
                                        {t.cropSuggestion.condition}: <span className="text-white font-medium">{cropSuggestion.weather.condition}</span>
                                    </p>
                                </motion.div>
                            )}

                            {/* Crop grid or empty state */}
                            {cropSuggestion?.data && cropSuggestion.data.length > 0 ? (
                                <>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-4 h-4 text-emerald-600" />
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold text-emerald-700">{cropSuggestion.count}</span> {t.cropSuggestion.cropsFound}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {cropSuggestion.data.map((item, i) => {
                                            const soilList = item.crop.suitableSoil
                                                ? item.crop.suitableSoil.map((s) => s.trim()).filter(Boolean)
                                                : []

                                            return (
                                                <Link href={item.crop._id}
                                                    key={item.crop._id}
                                                >
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.35, delay: i * 0.04 }}
                                                        whileHover={{ y: -4 }}
                                                        className="group bg-white rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300 overflow-hidden flex flex-col"
                                                    >
                                                        {/* Image */}
                                                        <div className="relative h-40 w-full bg-emerald-50 overflow-hidden">
                                                            {item.crop.image ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img
                                                                    src={item.crop.image}
                                                                    alt={item.crop.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Sprout className="w-12 h-12 text-emerald-300" />
                                                                </div>
                                                            )}

                                                            {item.crop.category && (
                                                                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm border border-emerald-100 capitalize">
                                                                    {item.crop.category}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                                                    {locale === 'bn' ? item.crop.banglaName : item.crop.name}
                                                                </h3>

                                                                {item.crop.waterRequirement && (
                                                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                                                                        <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                                                        <span className="truncate">{t.cropSuggestion.waterRequirement}:</span>
                                                                        <span className="font-semibold text-gray-700 capitalize">
                                                                            {item.crop.waterRequirement}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {soilList.length > 0 && (
                                                                <div className="pt-3 border-t border-emerald-50">
                                                                    <p className="text-[10px] font-medium text-gray-400 mb-1.5 flex items-center gap-1">
                                                                        <Layers className="w-3 h-3" />
                                                                        <span>{t.cropSuggestion.suitableSoil}</span>
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {soilList.map((soil, idx) => (
                                                                            <span
                                                                                key={idx}
                                                                                className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-md font-medium"
                                                                            >
                                                                                {soil}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center text-center py-20 bg-white border border-emerald-100 rounded-3xl"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                        <PackageSearch className="w-7 h-7 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">{t.cropSuggestion.noData}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default CropSuggestionPage