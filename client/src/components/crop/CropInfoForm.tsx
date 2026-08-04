"use client"

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useLanguage } from '@/context/LanguageContext'
import { CloudSun, Upload, Image as ImageIcon, ArrowRight } from 'lucide-react'
import { CATEGORIES_MAP } from '@/constants/constantValues'
import { createCrop, updateCrop } from '@/store/slice/cropSlice'
import { Crop } from '@/types/cropTypes'

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

interface CropInfoFormProps {
    mode: 'create' | 'edit'
    cropId?: string // required for edit
    defaultValues?: Crop | null // required for edit
    onSuccess?: (crop: Crop) => void
}

// create mode e সব field always পাঠানো হবে (আগের logic অক্ষুণ্ণ)
// edit mode e শুধু changed field গুলো FormData তে যাবে
const buildCropFormData = (
    data: CropFormInputs,
    mode: 'create' | 'edit',
    defaultValues?: Crop | null
) => {
    const formData = new FormData()
    const changed = (value: any, oldValue: any) => mode === 'create' || value !== oldValue

    if (changed(data.name, defaultValues?.name)) {
        formData.append('name', data.name)
    }
    if (changed(data.banglaName, defaultValues?.banglaName)) {
        formData.append('banglaName', data.banglaName)
    }
    if (changed(data.category, defaultValues?.category)) {
        formData.append('category', data.category)
    }
    if (changed(data.description || '', defaultValues?.description || '')) {
        if (data.description) formData.append('description', data.description)
    }

    const wr = data.weatherRequirement
    const oldWr = defaultValues?.weatherRequirement
    const weatherChanged =
        mode === 'create' ||
        wr.minTemperature !== oldWr?.minTemperature ||
        wr.maxTemperature !== oldWr?.maxTemperature ||
        wr.maxHumidity !== oldWr?.maxHumidity ||
        wr.maxRainProbability !== oldWr?.maxRainProbability

    // backend crop.weatherRequirement = weatherRequirement ?? crop.weatherRequirement
    // pura object replace hoy, tai kichu change hole current form er pura weatherRequirement pathano hocche
    if (weatherChanged) {
        formData.append('weatherRequirement[minTemperature]', String(wr.minTemperature))
        formData.append('weatherRequirement[maxTemperature]', String(wr.maxTemperature))
        if (wr.maxHumidity !== undefined && wr.maxHumidity !== null && !Number.isNaN(wr.maxHumidity)) {
            formData.append('weatherRequirement[maxHumidity]', String(wr.maxHumidity))
        }
        if (wr.maxRainProbability !== undefined && wr.maxRainProbability !== null && !Number.isNaN(wr.maxRainProbability)) {
            formData.append('weatherRequirement[maxRainProbability]', String(wr.maxRainProbability))
        }
    }

    if (data.image && data.image[0]) {
        formData.append('image', data.image[0])
    }

    return formData
}

const CropInfoForm = ({ mode, cropId, defaultValues, onSuccess }: CropInfoFormProps) => {
    const dispatch = useDispatch<AppDispatch>()
    const { cropLoading } = useSelector((state: RootState) => state.crop)
    const { t, locale } = useLanguage()

    const [imagePreview, setImagePreview] = useState<string | null>(
        mode === 'edit' ? defaultValues?.image?.url || null : null
    )

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CropFormInputs>()

    // edit mode e data ashar por form populate
    useEffect(() => {
        if (mode === 'edit' && defaultValues) {
            reset({
                name: defaultValues.name,
                banglaName: defaultValues.banglaName,
                category: defaultValues.category,
                description: defaultValues.description,
                weatherRequirement: {
                    minTemperature: defaultValues.weatherRequirement?.minTemperature,
                    maxTemperature: defaultValues.weatherRequirement?.maxTemperature,
                    maxHumidity: defaultValues.weatherRequirement?.maxHumidity,
                    maxRainProbability: defaultValues.weatherRequirement?.maxRainProbability
                }
            })
            setImagePreview(defaultValues.image?.url || null)
        }
    }, [mode, defaultValues, reset])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) setImagePreview(URL.createObjectURL(file))
    }

    const onSubmit = async (data: CropFormInputs) => {
        if (mode === 'create') {
            const formData = buildCropFormData(data, 'create')
            try {
                const res = await dispatch(createCrop(formData)).unwrap()
                onSuccess?.(res.data)
            } catch (err) {
                console.error('Error creating crop:', err)
            }
            return
        }

        // edit mode
        if (!cropId) return
        const formData = buildCropFormData(data, 'edit', defaultValues)

        if ([...formData.keys()].length === 0) {
            alert(locale === 'bn' ? 'কোনো পরিবর্তন হয়নি' : 'Nothing changed')
            return
        }

        try {
            const res = await dispatch(updateCrop({ cropId, data:formData })).unwrap()
            onSuccess?.(res.data)
        } catch (err) {
            console.error('Error updating crop:', err)
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl border border-[#E1E5D8] shadow-[0_1px_2px_rgba(22,36,26,0.04)] overflow-hidden"
        >
            {/* Section: Identity */}
            <div className="p-6 sm:p-8 border-b border-[#EEF1E9]">
                <p className="text-xs font-semibold tracking-[0.15em] text-[#7A8A72] uppercase mb-4">
                    {t?.addCropPage?.identitySection || 'Identity'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                            {t?.addCropPage?.cropNameEn || 'Crop name (English)'} <span className="text-[#A13F2E]">*</span>
                        </label>
                        <input
                            {...register('name', { required: t?.addCropPage?.validation?.nameRequired || 'Crop name is required' })}
                            className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] focus:bg-white outline-none transition"
                            placeholder="e.g., Rice"
                        />
                        {errors.name && <p className="text-[#A13F2E] text-xs mt-1.5">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                            {t?.addCropPage?.cropNameBn || 'Crop name (Bangla)'} <span className="text-[#A13F2E]">*</span>
                        </label>
                        <input
                            {...register('banglaName', { required: t?.addCropPage?.validation?.banglaNameRequired || 'Bangla crop name is required' })}
                            className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] placeholder:text-[#A3ACA0] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] focus:bg-white outline-none transition"
                            placeholder="যেমন: ধান"
                        />
                        {errors.banglaName && <p className="text-[#A13F2E] text-xs mt-1.5">{errors.banglaName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                            {t?.addCropPage?.category || 'Category'} <span className="text-[#A13F2E]">*</span>
                        </label>
                        <select
                            {...register('category', { required: t?.addCropPage?.validation?.categoryRequired || 'Category is required' })}
                            className="w-full px-3.5 py-2.5 bg-[#FAFBF8] border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] focus:bg-white outline-none transition"
                        >
                            <option value="">{t?.addCropPage?.selectCategory || 'Select category'}</option>
                            {CATEGORIES_MAP.map((cat) => (
                                <option key={cat.en} value={cat.en}>
                                    {locale === 'bn' ? cat.bn : cat.en}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="text-[#A13F2E] text-xs mt-1.5">{errors.category.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                            {t?.addCropPage?.cropImage || 'Crop image'} {mode === 'create' && <span className="text-[#A13F2E]">*</span>}
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
                                    {...register('image', {
                                        required: mode === 'create'
                                            ? (t?.addCropPage?.validation?.imageRequired || 'Crop image is required')
                                            : false,
                                        onChange: handleImageChange
                                    })}
                                />
                            </label>
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="w-11 h-11 rounded-lg object-cover border border-[#DDE1D6]" />
                            )}
                        </div>
                        {errors.image && <p className="text-[#A13F2E] text-xs mt-1.5">{errors.image.message}</p>}
                    </div>
                </div>

                <div className="mt-5">
                    <label className="block text-sm font-medium text-[#16241A] mb-1.5">
                        {t?.addCropPage?.description || 'Description'}
                    </label>
                    <textarea
                        {...register('description')}
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
                            {...register('weatherRequirement.minTemperature', {
                                required: t?.addCropPage?.validation?.minTempRequired || 'Min temp required',
                                valueAsNumber: true
                            })}
                            className="w-full px-3 py-2 bg-white border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                        />
                        {errors.weatherRequirement?.minTemperature && (
                            <p className="text-[#A13F2E] text-xs mt-1.5">{errors.weatherRequirement.minTemperature.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#5B6B5F] mb-1.5">
                            {t?.addCropPage?.maxTemp || 'Max temperature (°C)'} <span className="text-[#A13F2E]">*</span>
                        </label>
                        <input
                            type="number"
                            step="any"
                            {...register('weatherRequirement.maxTemperature', {
                                required: t?.addCropPage?.validation?.maxTempRequired || 'Max temp required',
                                valueAsNumber: true
                            })}
                            className="w-full px-3 py-2 bg-white border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                        />
                        {errors.weatherRequirement?.maxTemperature && (
                            <p className="text-[#A13F2E] text-xs mt-1.5">{errors.weatherRequirement.maxTemperature.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#5B6B5F] mb-1.5">
                            {t?.addCropPage?.maxHumidity || 'Max humidity (%)'}
                        </label>
                        <input
                            type="number"
                            step="any"
                            {...register('weatherRequirement.maxHumidity', { valueAsNumber: true })}
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
                            {...register('weatherRequirement.maxRainProbability', { valueAsNumber: true })}
                            className="w-full px-3 py-2 bg-white border border-[#DDE1D6] rounded-lg text-[#16241A] focus:ring-2 focus:ring-[#1E3A2B]/20 focus:border-[#1E3A2B] outline-none transition"
                        />
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-8">
                <button
                    type="submit"
                    disabled={cropLoading}
                    className="w-full sm:w-auto sm:ml-auto sm:flex bg-[#1E3A2B] text-white px-6 py-3 rounded-lg hover:bg-[#17301F] transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {cropLoading
                        ? (t?.addCropPage?.saving || 'Saving...')
                        : mode === 'create'
                            ? (t?.addCropPage?.saveAndContinue || 'Save & continue')
                            : (t?.addCropPage?.update || 'Update crop')}
                    <ArrowRight size={18} />
                </button>
            </div>
        </form>
    )
}

export default CropInfoForm