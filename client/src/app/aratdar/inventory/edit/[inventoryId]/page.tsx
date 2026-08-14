"use client"

import React, { useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { useLanguage } from '@/context/LanguageContext'
import { CATEGORIES_MAP } from '@/constants/constantValues'
import {
  Wheat,
  Tag,
  Layers,
  Scale,
  Boxes,
  BadgeDollarSign,
  FileText,
  ImagePlus,
  X,
  Loader2,
} from 'lucide-react'
import { editInventory, getInventoryDetails } from '@/store/slice/inventorySlice'
import { useParams, useRouter } from 'next/navigation'

interface IEditInventoryFormInput {
  productName: string
  category: string
  totalQuantity: number
  allocatedQuantity: number
  pricePerUnit: number
  unit: 'kg' | 'mon' | 'ton' | 'piece'
  description?: string
  image?: FileList
}

const UNITS = [
  { value: 'kg', labelKey: 'kg' },
  { value: 'mon', labelKey: 'mon' },
  { value: 'ton', labelKey: 'ton' },
  { value: 'piece', labelKey: 'piece' },
] as const

const EditInventoryPage = () => {
  const { inventoryId } = useParams()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { inventoryLoading, inventoryDetails } = useSelector((state: RootState) => state.inventory)
  const { t, locale } = useLanguage()

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IEditInventoryFormInput>({
    mode: 'onChange',
  })

  // Watch totalQuantity to validate allocatedQuantity dynamically
  const watchTotalQuantity = watch('totalQuantity')

  // Fetch details on mount
  useEffect(() => {
    if (inventoryId && (!inventoryDetails || inventoryDetails._id !== inventoryId)) {
      dispatch(getInventoryDetails({ inventoryId: inventoryId as string }))
    }
  }, [dispatch, inventoryId, inventoryDetails])

  // Pre-fill form values
  useEffect(() => {
    if (inventoryDetails && inventoryDetails._id === inventoryId) {
      reset({
        productName: inventoryDetails.productName,
        category: inventoryDetails.category,
        totalQuantity: inventoryDetails.totalQuantity,
        allocatedQuantity: inventoryDetails.allocatedQuantity,
        pricePerUnit: inventoryDetails.pricePerUnit,
        unit: inventoryDetails.unit,
        description: inventoryDetails.description || '',
      })

      if (inventoryDetails.image?.url) {
        setImagePreview(inventoryDetails.image.url)
      }
    }
  }, [inventoryDetails, inventoryId, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const dt = new DataTransfer()
      dt.items.add(file)
      setValue('image', dt.files, { shouldValidate: true })
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setValue('image', undefined as unknown as FileList, { shouldValidate: true })
  }

  const onSubmit: SubmitHandler<IEditInventoryFormInput> = async (data) => {
    const formData = new FormData()

    formData.append('productName', data.productName.trim())
    formData.append('category', data.category)
    formData.append('totalQuantity', String(data.totalQuantity))
    formData.append('allocatedQuantity', String(data.allocatedQuantity))
    formData.append('pricePerUnit', String(data.pricePerUnit))
    formData.append('unit', data.unit)

    if (data.description) {
      formData.append('description', data.description.trim())
    }

    if (data.image && data.image[0]) {
      formData.append('image', data.image[0])
    }

    try {
      await dispatch(
        editInventory({
          inventoryId: inventoryId as string,
          data: formData,
        })
      ).unwrap()

      router.push(`/inventory/${inventoryId}`)
    } catch (error) {
      console.error('Failed to update inventory:', error)
    }
  }

  if (inventoryLoading && (!inventoryDetails || inventoryDetails._id !== inventoryId)) {
    return (
      <div className="min-h-screen bg-[#F5F8F5] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-sm font-medium text-gray-600">{t.editInventory.loadingText}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F8F5] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shadow-sm shadow-green-600/30">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {t.editInventory.title}
            </h2>
            <p className="text-sm text-gray-500">{t.editInventory.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-green-100/80 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Tag className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t.editInventory.basicInfoLabel}
              </h3>
            </div>

            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.editInventory.productNameLabel} <span className="text-green-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t.editInventory.productNamePlaceholder}
                  {...register('productName', {
                    required: t.editInventory.errors.productNameRequired,
                    validate: (val) => val.trim().length > 0 || t.editInventory.errors.productNameRequired,
                  })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition"
                />
                {errors.productName && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.productName.message}</p>
                )}
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    {t.editInventory.categoryLabel} <span className="text-green-600">*</span>
                  </label>
                  <select
                    {...register('category', {
                      required: t.editInventory.errors.categoryRequired,
                    })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition"
                  >
                    <option value="">{t.editInventory.selectCategory}</option>
                    {CATEGORIES_MAP.map((item) => (
                      <option key={item.en} value={item.en}>
                        {locale === 'bn' ? item.bn : item.en}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Scale className="w-3.5 h-3.5 text-gray-400" />
                    {t.editInventory.unitLabel} <span className="text-green-600">*</span>
                  </label>
                  <select
                    {...register('unit', {
                      required: t.editInventory.errors.unitRequired,
                    })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition"
                  >
                    <option value="">{t.editInventory.selectUnit}</option>
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {t.editInventory.units[u.labelKey]}
                      </option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.unit.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-green-100/80 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Boxes className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t.editInventory.quantityPricingLabel}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.editInventory.totalQuantityLabel} <span className="text-green-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  {...register('totalQuantity', {
                    required: t.editInventory.errors.totalQuantityRequired,
                    min: { value: 1, message: t.editInventory.errors.totalQuantityMin },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition"
                />
                {errors.totalQuantity && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.totalQuantity.message}</p>
                )}
              </div>

              {/* Allocated Quantity with Backend Comparison Match */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.editInventory.allocatedQuantityLabel} <span className="text-green-600">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('allocatedQuantity', {
                    required: t.editInventory.errors.allocatedQuantityRequired,
                    min: { value: 0, message: t.editInventory.errors.allocatedQuantityMin },
                    valueAsNumber: true,
                    validate: (value) =>
                      value <= watchTotalQuantity ||
                      (locale === 'bn'
                        ? 'বরাদ্দকৃত পরিমাণ মোট পরিমাণের চেয়ে বেশি হতে পারবে না'
                        : 'Allocated quantity cannot be greater than total quantity'),
                  })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition"
                />
                {errors.allocatedQuantity && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.allocatedQuantity.message}
                  </p>
                )}
              </div>

              {/* Price Per Unit */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                  <BadgeDollarSign className="w-3.5 h-3.5 text-gray-400" />
                  {t.editInventory.pricePerUnitLabel} <span className="text-green-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  {...register('pricePerUnit', {
                    required: t.editInventory.errors.pricePerUnitRequired,
                    min: { value: 1, message: t.editInventory.errors.pricePerUnitMin },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition"
                />
                {errors.pricePerUnit && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.pricePerUnit.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Image */}
          <div className="bg-white rounded-2xl shadow-sm border border-green-100/80 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {t.editInventory.detailsLabel}
              </h3>
            </div>

            <div className="space-y-5">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.editInventory.descriptionLabel}
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder={t.editInventory.descriptionPlaceholder}
                  {...register('description', {
                    maxLength: {
                      value: 300,
                      message: t.editInventory.errors.descriptionMax,
                    },
                  })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 resize-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 outline-none transition"
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.description.message}</p>
                )}
              </div>

              {/* Image Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.editInventory.imageLabel}
                </label>

                {!imagePreview ? (
                  <label
                    htmlFor="edit-inventory-image-input"
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed rounded-xl cursor-pointer transition ${isDragging
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-400 hover:bg-green-50/50'
                      }`}
                  >
                    <ImagePlus className="w-7 h-7 text-green-600" />
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-green-600">
                        {t.editInventory.uploadClick}
                      </span>{' '}
                      {t.editInventory.uploadDrag}
                    </p>
                    <p className="text-xs text-gray-400">{t.editInventory.uploadHint}</p>
                    <input
                      id="edit-inventory-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register('image', {
                        onChange: handleImageChange,
                        validate: {
                          isImage: (files) => {
                            if (!files || files.length === 0) return true
                            return (
                              files[0].type.startsWith('image/') ||
                              (locale === 'bn' ? 'শুধু ইমেজ ফাইল অনুমোদিত' : 'Only image files are allowed')
                            )
                          },
                        },
                      })}
                    />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      className="w-36 h-36 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition"
                      aria-label="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.image.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={inventoryLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium rounded-xl shadow-sm shadow-green-600/20 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {inventoryLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {inventoryLoading ? t.editInventory.submitting : t.editInventory.submitButton}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditInventoryPage