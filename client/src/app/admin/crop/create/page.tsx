"use client"

import React, { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useLanguage } from '@/context/LanguageContext'
import {
    Sprout,
    CloudSun,
    MapPin,
    Calendar,
    Plus,
    Trash2,
    Upload,
    CheckCircle2,
    SkipForward,
    ArrowRight,
    Image as ImageIcon,
    Info,
    Leaf
} from 'lucide-react'
import { CATEGORIES_MAP, DISTRICTS, DISTRICTS_BN, MONTHS } from '@/constants/constantValues'
import { createCrop, createRecommendation } from '@/store/slice/cropSlice'
import { useRouter } from 'next/navigation'

interface CropFormInputs {
    name: string
    banglaName: string
    category: string
    description?: string
    weatherRequirement: {
        minTemperature: number
        maxTemperature: number
        maxHumidity?: number
        maxRainProbability?: number
    }
    image: FileList
}

interface RecommendationInputs {
    districts: string[]
    plantingMonths: number[]
    season: "kharif-1" | "kharif-2" | "rabi" | "all"
    reason?: string
    tips?: { value: string }[]
}

const AddCropPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { cropLoading, cropDetails } = useSelector((state: RootState) => state.crop)
    const { t, locale } = useLanguage()
    const router = useRouter()

    const [step, setStep] = useState<1 | 2>(1)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Form 1: Crop Creation
    const {
        register: registerCrop,
        handleSubmit: handleCropSubmit,
        formState: { errors: cropErrors }
    } = useForm<CropFormInputs>()

    // Form 2: Recommendation
    const {
        register: registerRec,
        handleSubmit: handleRecSubmit,
        control: recControl,
        formState: { errors: recErrors }
    } = useForm<RecommendationInputs>({
        defaultValues: {
            districts: [],
            plantingMonths: [],
            tips: [{ value: '' }]
        }
    })

    const { fields: tipFields, append: appendTip, remove: removeTip } = useFieldArray({
        control: recControl,
        name: "tips" as never
    })

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImagePreview(URL.createObjectURL(file))
        }
    }

    // Submit Step 1: Crop Data (FormData)
    const onCropSubmit = async (data: CropFormInputs) => {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('banglaName', data.banglaName)
        formData.append('category', data.category)
        if (data.description) formData.append('description', data.description)

        formData.append('weatherRequirement[minTemperature]', String(data.weatherRequirement.minTemperature))
        formData.append('weatherRequirement[maxTemperature]', String(data.weatherRequirement.maxTemperature))
        if (data.weatherRequirement.maxHumidity) {
            formData.append('weatherRequirement[maxHumidity]', String(data.weatherRequirement.maxHumidity))
        }
        if (data.weatherRequirement.maxRainProbability) {
            formData.append('weatherRequirement[maxRainProbability]', String(data.weatherRequirement.maxRainProbability))
        }

        if (data.image && data.image[0]) {
            formData.append('image', data.image[0])
        }

        try {
            await dispatch(createCrop(formData)).unwrap()
            setStep(2)
        } catch (err) {
            console.error('Error creating crop:', err)
        }
    }

    // Submit Step 2: Recommendation Data (JSON Object)
    const onRecSubmit = async (data: RecommendationInputs) => {
        if (!cropDetails.crop?._id) return

        const payload = {
            cropId: cropDetails.crop._id,
            districts: data.districts,
            plantingMonths: data.plantingMonths.map(Number),
            season: data.season || undefined,
            reason: data.reason || undefined,
            tips: data.tips ? data.tips.map(t => t.value).filter(Boolean) : []
        }

        try {
            await dispatch(createRecommendation(payload)).unwrap()
            router.push(`/crop/${cropDetails.crop._id}`)
        } catch (err) {
            console.error('Error saving recommendation:', err)
        }
    }

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

                {/* Page heading */}
                <div className="mb-8">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#7A8A72] uppercase mb-1.5">
                        {t?.addCropPage?.eyebrow || 'Crop Registry'}
                    </p>
                    <h1 className="font-serif text-2xl sm:text-3xl text-[#16241A] font-medium">
                        {t?.addCropPage?.pageTitle || 'Add a new crop to the registry'}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-10">

                    {/* LEFT: Growth-path stepper */}
                    <div className="lg:sticky lg:top-10 lg:self-start">
                        <div className="flex lg:flex-col gap-0 lg:gap-0 bg-white rounded-2xl border border-[#E1E5D8] p-5 lg:p-6 shadow-[0_1px_2px_rgba(22,36,26,0.04)]">

                            {/* Step 1 */}
                            <div className="flex-1 lg:flex-none flex lg:block items-start gap-3">
                                <div className="flex lg:flex-row flex-col items-center lg:items-start">
                                    <div
                                        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${step === 1
                                            ? 'bg-[#1E3A2B] border-[#1E3A2B] text-white'
                                            : 'bg-[#EEF1E9] border-[#EEF1E9] text-[#7A8A72]'
                                            }`}
                                    >
                                        <Sprout size={16} />
                                    </div>
                                    {/* connector */}
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

                            {/* Step 2 */}
                            <div className="flex-1 lg:flex-none flex lg:block items-start gap-3">
                                <div
                                    className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${step === 2
                                        ? 'bg-[#1E3A2B] border-[#1E3A2B] text-white'
                                        : 'bg-[#EEF1E9] border-[#EEF1E9] text-[#7A8A72]'
                                        }`}
                                >
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

                    {/* RIGHT: Form content */}
                    <div>

                        {/* STEP 1: ADD CROP FORM */}
                        {step === 1 && (
                            <form
                                onSubmit={handleCropSubmit(onCropSubmit)}
                                className="bg-white rounded-2xl border border-[#E1E5D8] shadow-[0_1px_2px_rgba(22,36,26,0.04)] overflow-hidden"
                            >
                                {/* Section: Identity */}
                                <div className="p-6 sm:p-8 border-b border-[#EEF1E9]">
                                    <p className="text-xs font-semibold tracking-[0.15em] text-[#7A8A72] uppercase mb-4">
                                        {t?.addCropPage?.identitySection || 'Identity'}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* English Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                                                {t?.addCropPage?.cropNameEn || 'Crop name (English)'} <span className="text-[#A13F2E]">*</span>
                                            </label>
                                            <input
                                                {...registerCrop('name', { required: t?.addCropPage?.validation?.nameRequired || 'Crop name is required' })}
                                                className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] focus:bg-white outline-none transition"
                                                placeholder="e.g., Rice"
                                            />
                                            {cropErrors.name && <p className="text-[#A13F2E] text-xs mt-1.5">{cropErrors.name.message}</p>}
                                        </div>

                                        {/* Bangla Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                                                {t?.addCropPage?.cropNameBn || 'Crop name (Bangla)'} <span className="text-[#A13F2E]">*</span>
                                            </label>
                                            <input
                                                {...registerCrop('banglaName', { required: t?.addCropPage?.validation?.banglaNameRequired || 'Bangla crop name is required' })}
                                                className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] focus:bg-white outline-none transition"
                                                placeholder="যেমন: ধান"
                                            />
                                            {cropErrors.banglaName && <p className="text-[#A13F2E] text-xs mt-1.5">{cropErrors.banglaName.message}</p>}
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                                                {t?.addCropPage?.category || 'Category'} <span className="text-[#A13F2E]">*</span>
                                            </label>
                                            <select
                                                {...registerCrop('category', { required: t?.addCropPage?.validation?.categoryRequired || 'Category is required' })}
                                                className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] focus:bg-white outline-none transition"
                                            >
                                                <option value="">{t?.addCropPage?.selectCategory || 'Select category'}</option>
                                                {CATEGORIES_MAP.map((cat) => (
                                                    <option key={cat.en} value={cat.en}>
                                                        {locale === 'bn' ? cat.bn : cat.en}
                                                    </option>
                                                ))}
                                            </select>
                                            {cropErrors.category && <p className="text-[#A13F2E] text-xs mt-1.5">{cropErrors.category.message}</p>}
                                        </div>

                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                                                {t?.addCropPage?.cropImage || 'Crop image'} <span className="text-[#A13F2E]">*</span>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-[#B9C4AE] rounded-lg cursor-pointer bg-[#FAFBF8] hover:bg-[#F1F4EC] hover:border-[#1E3A2B] text-sm text-[#3E5241] font-medium transition">
                                                    {imagePreview ? <ImageIcon size={17} /> : <Upload size={17} />}
                                                    {imagePreview
                                                        ? (t?.addCropPage?.changeImage || 'Change image')
                                                        : (t?.addCropPage?.chooseImage || 'Choose image')}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        {...registerCrop('image', {
                                                            required: t?.addCropPage?.validation?.imageRequired || 'Crop image is required',
                                                            onChange: handleImageChange
                                                        })}
                                                    />
                                                </label>
                                                {imagePreview && (
                                                    <img src={imagePreview} alt="Preview" className="w-11 h-11 rounded-lg object-cover border border-[#DDE1D6]" />
                                                )}
                                            </div>
                                            {cropErrors.image && <p className="text-[#A13F2E] text-xs mt-1.5">{cropErrors.image.message}</p>}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mt-5">
                                        <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                                            {t?.addCropPage?.description || 'Description'}
                                        </label>
                                        <textarea
                                            {...registerCrop('description')}
                                            rows={3}
                                            className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] focus:bg-white outline-none transition resize-none"
                                            placeholder={t?.addCropPage?.descriptionPlaceholder || 'Provide a brief description...'}
                                        />
                                    </div>
                                </div>

                                {/* Section: Weather Requirements */}
                                <div className="p-6 sm:p-8 border-b border-[#EEF1E9]">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CloudSun size={16} className="text-[#7A8A72]" />
                                        <p className="text-xs font-semibold tracking-[0.15em] text-[#7A8A72] uppercase">
                                            {t?.addCropPage?.weatherRequirement || 'Weather requirements'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-[#5B6B5F] mb-1.5">
                                                {t?.addCropPage?.minTemp || 'Min temperature (°C)'} <span className="text-[#A13F2E]">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                {...registerCrop('weatherRequirement.minTemperature', {
                                                    required: t?.addCropPage?.validation?.minTempRequired || 'Min temp required',
                                                    valueAsNumber: true
                                                })}
                                                className="w-full px-3 py-2 bg-white border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                            />
                                            {cropErrors.weatherRequirement?.minTemperature && (
                                                <p className="text-[#A13F2E] text-xs mt-1.5">{cropErrors.weatherRequirement.minTemperature.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-[#5B6B5F] mb-1.5">
                                                {t?.addCropPage?.maxTemp || 'Max temperature (°C)'} <span className="text-[#A13F2E]">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                {...registerCrop('weatherRequirement.maxTemperature', {
                                                    required: t?.addCropPage?.validation?.maxTempRequired || 'Max temp required',
                                                    valueAsNumber: true
                                                })}
                                                className="w-full px-3 py-2 bg-white border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                            />
                                            {cropErrors.weatherRequirement?.maxTemperature && (
                                                <p className="text-[#A13F2E] text-xs mt-1.5">{cropErrors.weatherRequirement.maxTemperature.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-[#5B6B5F] mb-1.5">
                                                {t?.addCropPage?.maxHumidity || 'Max humidity (%)'}
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                {...registerCrop('weatherRequirement.maxHumidity', { valueAsNumber: true })}
                                                className="w-full px-3 py-2 bg-white border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-[#5B6B5F] mb-1.5">
                                                {t?.addCropPage?.maxRainProb || 'Max rain probability (%)'}
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                {...registerCrop('weatherRequirement.maxRainProbability', { valueAsNumber: true })}
                                                className="w-full px-3 py-2 bg-white border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="p-6 sm:p-8">
                                    <button
                                        type="submit"
                                        disabled={cropLoading}
                                        className="w-full sm:w-auto sm:ml-auto sm:flex bg-[#1E3A2B] text-white px-6 py-3 rounded-lg hover:bg-[#17301F] transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {cropLoading ? (t?.addCropPage?.saving || 'Saving...') : (t?.addCropPage?.saveAndContinue || 'Save & continue')}
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: CROP RECOMMENDATION FORM */}
                        {step === 2 && (
                            <form
                                onSubmit={handleRecSubmit(onRecSubmit)}
                                className="bg-white rounded-2xl border border-[#E1E5D8] shadow-[0_1px_2px_rgba(22,36,26,0.04)] overflow-hidden"
                            >
                                <div className="flex justify-between items-center gap-3 p-6 sm:p-8 border-b border-[#EEF1E9]">
                                    <div>
                                        <p className="text-xs font-semibold tracking-[0.15em] text-[#7A8A72] uppercase mb-1">
                                            {t?.addCropPage?.step2Title || 'Recommendations'}
                                        </p>
                                        <h2 className="font-serif text-lg text-[#16241A]">
                                            {t?.addCropPage?.addRecHeading || 'Where and when should this crop be grown?'}
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="shrink-0 text-xs sm:text-sm flex items-center gap-1.5 text-[#5B6B5F] hover:text-[#1E3A2B] border border-[#DDE1D6] px-3 py-2 rounded-lg hover:bg-[#F1F4EC] transition"
                                    >
                                        <SkipForward size={15} /> {t?.addCropPage?.skipStep || 'Skip this step'}
                                    </button>
                                </div>

                                <div className="p-6 sm:p-8 space-y-7">

                                    {/* Districts Selection */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-[#16241A] mb-2.5">
                                            <MapPin size={15} className="text-[#7A8A72]" /> {t?.addCropPage?.suitableDistricts || 'Suitable districts'} <span className="text-[#A13F2E]">*</span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 border border-[#E1E5D8] p-4 rounded-xl max-h-52 overflow-y-auto bg-[#FAFBF8]">
                                            {DISTRICTS.map((dist) => (
                                                <label key={dist} className="cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value={dist}
                                                        {...registerRec('districts', { required: t?.addCropPage?.validation?.districtRequired || 'Select at least one district' })}
                                                        className="peer sr-only"
                                                    />
                                                    <span className="inline-block text-xs sm:text-sm px-3 py-1.5 rounded-full border border-[#DDE1D6] bg-white text-[#3E5241] transition peer-checked:bg-[#1E3A2B] peer-checked:text-white peer-checked:border-[#1E3A2B] hover:border-[#1E3A2B]">
                                                        {locale === 'bn' ? DISTRICTS_BN[dist] || dist : dist}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {recErrors.districts && <p className="text-[#A13F2E] text-xs mt-1.5">{recErrors.districts.message}</p>}
                                    </div>

                                    {/* Planting Months */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-[#16241A] mb-2.5">
                                            <Calendar size={15} className="text-[#7A8A72]" /> {t?.addCropPage?.plantingMonths || 'Planting months'} <span className="text-[#A13F2E]">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 border border-[#E1E5D8] p-4 rounded-xl bg-[#FAFBF8]">
                                            {MONTHS.map((m) => (
                                                <label key={m.value} className="cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        value={m.value}
                                                        {...registerRec('plantingMonths', { required: t?.addCropPage?.validation?.monthRequired || 'Select at least one month' })}
                                                        className="peer sr-only"
                                                    />
                                                    <span className="flex items-center justify-center text-center text-xs px-2 py-2 rounded-lg border border-[#DDE1D6] bg-white text-[#3E5241] transition peer-checked:bg-[#1E3A2B] peer-checked:text-white peer-checked:border-[#1E3A2B] hover:border-[#1E3A2B]">
                                                        {locale === 'bn' ? m.labelBn : m.labelEn}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        {recErrors.plantingMonths && <p className="text-[#A13F2E] text-xs mt-1.5">{recErrors.plantingMonths.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        {/* Season */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                                                {t?.addCropPage?.season || 'Season'}
                                            </label>
                                            <select
                                                {...registerRec('season')}
                                                className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                            >
                                                <option value="">{t?.addCropPage?.selectSeason || 'Select season'}</option>
                                                <option value="kharif-1">Kharif-1</option>
                                                <option value="kharif-2">Kharif-2</option>
                                                <option value="rabi">Rabi</option>
                                                <option value="all">All Seasons</option>
                                            </select>
                                        </div>

                                        {/* Reason */}
                                        <div>
                                            <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                                                {t?.addCropPage?.reason || 'Recommendation reason'}
                                            </label>
                                            <input
                                                {...registerRec('reason')}
                                                className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                                placeholder={t?.addCropPage?.reasonPlaceholder || 'Why is this crop suitable...'}
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Tips List */}
                                    <div>
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-[#16241A] mb-2.5">
                                            <Leaf size={15} className="text-[#7A8A72]" /> {t?.addCropPage?.tips || 'Tips'}
                                        </label>
                                        <div className="space-y-2">
                                            {tipFields.map((field, index) => (
                                                <div key={field.id} className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-[#8B968A] w-5 shrink-0 text-center">{index + 1}</span>
                                                    <input
                                                        {...registerRec(`tips.${index}.value` as const)}
                                                        placeholder={`${t?.addCropPage?.tips || 'Tip'} #${index + 1}`}
                                                        className="flex-1 px-3.5 py-2 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-sm text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTip(index)}
                                                        className="shrink-0 text-[#A13F2E] hover:text-white hover:bg-[#A13F2E] p-2 rounded-lg border border-transparent hover:border-[#A13F2E] transition"
                                                        aria-label="Remove tip"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => appendTip({ value: '' })}
                                            className="text-xs flex items-center gap-1.5 text-[#1E3A2B] font-semibold hover:underline mt-3"
                                        >
                                            <Plus size={14} /> {t?.addCropPage?.addTip || 'Add another tip'}
                                        </button>
                                    </div>

                                    <div className="flex items-start gap-2 text-xs text-[#8B968A] bg-[#FAFBF8] border border-[#EEF1E9] rounded-lg p-3">
                                        <Info size={14} className="shrink-0 mt-0.5" />
                                        <span>{t?.addCropPage?.recNote || 'These recommendations help farmers know exactly where and when to plant. You can always edit them later.'}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 p-6 sm:p-8 border-t border-[#EEF1E9]">
                                    <button
                                        type="button"
                                        onClick={handleSkip}
                                        className="w-1/2 py-2.5 border border-[#DDE1D6] text-[#3E5241] rounded-lg hover:bg-[#F1F4EC] transition text-sm font-medium"
                                    >
                                        {t?.addCropPage?.skip || 'Skip'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-1/2 bg-[#1E3A2B] text-white py-2.5 rounded-lg hover:bg-[#17301F] transition text-sm font-medium"
                                    >
                                        {t?.addCropPage?.submitRec || 'Submit recommendation'}
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddCropPage