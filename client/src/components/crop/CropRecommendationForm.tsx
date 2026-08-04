"use client"

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useLanguage } from '@/context/LanguageContext'
import { MapPin, Calendar, Plus, Trash2, SkipForward, Info, Leaf } from 'lucide-react'
import { DISTRICTS, DISTRICTS_BN, MONTHS } from '@/constants/constantValues'
import { createRecommendation, updateRecommendation } from '@/store/slice/cropSlice'
import { CropRecommendation, UpdateRecommendationTypes } from '@/types/cropTypes'

interface RecommendationInputs {
    districts: string[]
    plantingMonths: string[] // Checkbox state maintain korar jonno string array
    season: "kharif-1" | "kharif-2" | "rabi" | "all"
    reason?: string
    tips?: { value: string }[]
}

interface CropRecommendationFormProps {
    mode: 'create' | 'edit'
    cropId?: string
    cropRecommendationId?: string
    defaultValues?: CropRecommendation | null
    onSuccess?: () => void
    onSkip?: () => void
}

const arraysEqual = (a?: any[], b?: any[]) => {
    if (!a && !b) return true
    if (!a || !b) return false
    if (a.length !== b.length) return false
    const sa = [...a].sort()
    const sb = [...b].sort()
    return sa.every((v, i) => v === sb[i])
}

const CropRecommendationForm = ({
    mode,
    cropId,
    cropRecommendationId,
    defaultValues,
    onSuccess,
    onSkip
}: CropRecommendationFormProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const { locale, t } = useLanguage()
    const [submitLoading, setSubmitLoading] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors }
    } = useForm<RecommendationInputs>({
        defaultValues: {
            districts: [],
            plantingMonths: [],
            tips: [{ value: '' }]
        }
    })

    const { fields: tipFields, append: appendTip, remove: removeTip } = useFieldArray({
        control,
        name: "tips" as never
    })

    // Form value watch kora hocche checked status thik thakar jonno
    const selectedDistricts = watch('districts') || []
    const selectedMonths = watch('plantingMonths') || []

    // Mode ba defaultValues change hole reset thikbhabe run korbe
    useEffect(() => {
        if (mode === 'edit' && defaultValues) {
            reset({
                districts: defaultValues.districts || [],
                // Number gulo ke string e convert kora hocche jate checkbox match hoy
                plantingMonths: defaultValues.plantingMonths
                    ? defaultValues.plantingMonths.map(String)
                    : [],
                season: defaultValues.season,
                reason: defaultValues.reason || '',
                tips: defaultValues.tips && defaultValues.tips.length > 0
                    ? defaultValues.tips.map(v => ({ value: v }))
                    : [{ value: '' }]
            })
        } else if (mode === 'create') {
            reset({
                districts: [],
                plantingMonths: [],
                season: undefined,
                reason: '',
                tips: [{ value: '' }]
            })
        }
    }, [mode, defaultValues, reset])

    const onSubmit = async (data: RecommendationInputs) => {
        const tips = data.tips ? data.tips.map(t => t.value).filter(Boolean) : []
        const monthsNumbers = data.plantingMonths.map(Number)

        if (mode === 'create' || !defaultValues) {
            if (!cropId) return
            const payload = {
                cropId,
                districts: data.districts,
                plantingMonths: monthsNumbers,
                season: data.season || undefined,
                reason: data.reason || undefined,
                tips
            }
            try {
                setSubmitLoading(true)
                await dispatch(createRecommendation(payload)).unwrap()
                onSuccess?.()
            } catch (err) {
                setSubmitLoading(false)
                console.error('Error saving recommendation:', err)
            } finally {
                setSubmitLoading(false)
            }
            return
        }

        // edit mode - backend payload e month gulo ke number hisebe patano hocche
        if (!cropRecommendationId) return
        const payload: UpdateRecommendationTypes = { cropRecommendationId }

        if (!arraysEqual(data.districts, defaultValues?.districts)) {
            payload.districts = data.districts
        }
        if (!arraysEqual(monthsNumbers, defaultValues?.plantingMonths)) {
            payload.plantingMonths = monthsNumbers
        }
        if (data.season && data.season !== defaultValues?.season) {
            payload.season = data.season
        }
        if ((data.reason || '') !== (defaultValues?.reason || '')) {
            payload.reason = data.reason || undefined
        }
        if (!arraysEqual(tips, defaultValues?.tips)) {
            payload.tips = tips
        }

        if (Object.keys(payload).length === 1) {
            alert(locale === 'bn' ? 'কোনো পরিবর্তন হয়নি' : 'Nothing changed')
            return
        }

        try {
            setSubmitLoading(true)
            await dispatch(updateRecommendation(payload)).unwrap()
            onSuccess?.()
        } catch (err) {
            setSubmitLoading(false)
            console.error('Error updating recommendation:', err)
        } finally {
            setSubmitLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
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
                {onSkip && (
                    <button
                        type="button"
                        onClick={onSkip}
                        className="shrink-0 text-xs sm:text-sm flex items-center gap-1.5 text-[#5B6B5F] hover:text-[#1E3A2B] border border-[#DDE1D6] px-3 py-2 rounded-lg hover:bg-[#F1F4EC] transition cursor-pointer"
                    >
                        <SkipForward size={15} /> {t?.addCropPage?.skipStep || 'Skip this step'}
                    </button>
                )}
            </div>

            <div className="p-6 sm:p-8 space-y-7">
                {/* Districts */}
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
                                    checked={selectedDistricts.includes(dist)}
                                    {...register('districts', { required: t?.addCropPage?.validation?.districtRequired || 'Select at least one district' })}
                                    className="peer sr-only"
                                />
                                <span className="inline-block text-xs sm:text-sm px-3 py-1.5 rounded-full border border-[#DDE1D6] bg-white text-[#3E5241] transition peer-checked:bg-[#1E3A2B] peer-checked:text-white peer-checked:border-[#1E3A2B] hover:border-[#1E3A2B]">
                                    {locale === 'bn' ? DISTRICTS_BN[dist] || dist : dist}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.districts && <p className="text-[#A13F2E] text-xs mt-1.5">{errors.districts.message}</p>}
                </div>

                {/* Planting Months */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-[#16241A] mb-2.5">
                        <Calendar size={15} className="text-[#7A8A72]" /> {t?.addCropPage?.plantingMonths || 'Planting months'} <span className="text-[#A13F2E]">*</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 border border-[#E1E5D8] p-4 rounded-xl bg-[#FAFBF8]">
                        {MONTHS.map((m) => {
                            const monthValStr = String(m.value)
                            const isChecked = selectedMonths.includes(monthValStr)
                            return (
                                <label key={m.value} className="cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={monthValStr}
                                        checked={isChecked}
                                        {...register('plantingMonths', { required: t?.addCropPage?.validation?.monthRequired || 'Select at least one month' })}
                                        className="peer sr-only"
                                    />
                                    <span className="flex items-center justify-center text-center text-xs px-2 py-2 rounded-lg border border-[#DDE1D6] bg-white text-[#3E5241] transition peer-checked:bg-[#1E3A2B] peer-checked:text-white peer-checked:border-[#1E3A2B] hover:border-[#1E3A2B]">
                                        {locale === 'bn' ? m.labelBn : m.labelEn}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                    {errors.plantingMonths && <p className="text-[#A13F2E] text-xs mt-1.5">{errors.plantingMonths.message}</p>}
                </div>

                {/* Season & Reason */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                            {t?.addCropPage?.season || 'Season'}
                        </label>
                        <select
                            {...register('season')}
                            className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                        >
                            <option value="">{t?.addCropPage?.selectSeason || 'Select season'}</option>
                            <option value="kharif-1">Kharif-1</option>
                            <option value="kharif-2">Kharif-2</option>
                            <option value="rabi">Rabi</option>
                            <option value="all">All Seasons</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                            {t?.addCropPage?.reason || 'Recommendation reason'}
                        </label>
                        <input
                            {...register('reason')}
                            className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                            placeholder={t?.addCropPage?.reasonPlaceholder || 'Why is this crop suitable...'}
                        />
                    </div>
                </div>

                {/* Tips */}
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-[#16241A] mb-2.5">
                        <Leaf size={15} className="text-[#7A8A72]" /> {t?.addCropPage?.tips || 'Tips'}
                    </label>
                    <div className="space-y-2">
                        {tipFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2">
                                <span className="text-xs font-medium text-[#8B968A] w-5 shrink-0 text-center">{index + 1}</span>
                                <input
                                    {...register(`tips.${index}.value` as const)}
                                    placeholder={`${t?.addCropPage?.tips || 'Tip'} #${index + 1}`}
                                    className="flex-1 px-3.5 py-2 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-sm text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTip(index)}
                                    className="shrink-0 text-[#A13F2E] hover:text-white hover:bg-[#A13F2E] p-2 rounded-lg border border-transparent hover:border-[#A13F2E] transition cursor-pointer"
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
                        className="text-xs flex items-center gap-1.5 text-[#1E3A2B] font-semibold hover:underline mt-3 cursor-pointer"
                    >
                        <Plus size={14} /> {t?.addCropPage?.addTip || 'Add another tip'}
                    </button>
                </div>

                <div className="flex items-start gap-2 text-xs text-[#8B968A] bg-[#FAFBF8] border border-[#EEF1E9] rounded-lg p-3">
                    <Info size={14} className="shrink-0 mt-0.5" />
                    <span>{t?.addCropPage?.recNote || 'These recommendations help farmers know exactly where and when to plant. You can always edit them later.'}</span>
                </div>
            </div>

            <div className="flex gap-3 p-6 sm:p-8 border-t border-[#EEF1E9]">
                {onSkip && (
                    <button
                        type="button"
                        onClick={onSkip}
                        className="w-1/2 py-2.5 border border-[#DDE1D6] text-[#3E5241] rounded-lg hover:bg-[#F1F4EC] transition text-sm font-medium cursor-pointer"
                    >
                        {t?.addCropPage?.skip || 'Skip'}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={submitLoading}
                    className={`${onSkip ? 'w-1/2' : 'w-full'} bg-[#1E3A2B] text-white py-2.5 rounded-lg hover:bg-[#17301F] transition text-sm font-medium disabled:opacity-50 cursor-pointer`}
                >
                    {mode === 'create'
                        ? (t?.addCropPage?.submitRec || 'Submit recommendation')
                        : (t?.addCropPage?.updateRec || 'Update recommendation')}
                </button>
            </div>
        </form>
    )
}

export default CropRecommendationForm