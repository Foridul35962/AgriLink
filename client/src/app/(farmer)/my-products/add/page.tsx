"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FieldErrors } from "react-hook-form";
import { motion } from "framer-motion";
import {
  Sprout,
  Package,
  Tags,
  Hash,
  Coins,
  MapPin,
  CalendarDays,
  AlignLeft,
  ImagePlus,
  X,
  ArrowRight,
  Leaf,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_VALUES, DISTRICTS, UNITS } from "@/constants/constantValues";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { addProduct } from "@/store/slice/productSlice";


type Unit = (typeof UNITS)[number];


const MAX_IMAGE_MB = 5;
const MAX_DESCRIPTION_LENGTH = 300;

type ProductFormValues = {
  name: string;
  category: string;
  quantity: string;
  pricePerUnit: string;
  district: string;
  harvestDate: string;
  unit: Unit | "";
  description: string;
  image: FileList | null;
};

export default function AddProductPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const dispatch = useDispatch<AppDispatch>()

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({ mode: "onTouched" });

  const description = watch("description") || "";

  const processAndSetFile = (file: File | undefined) => {
    if (!file) return;

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError("image", {
        type: "manual",
        message: `Image must be under ${MAX_IMAGE_MB}MB`,
      });
      return;
    }

    clearErrors("image");

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const fileList = dataTransfer.files;

    setValue("image", fileList, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    processAndSetFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image", null, {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: ProductFormValues) => {
    setServerError("");
    console.log("🚀 Form Submitted Successfully! Data:", data);

    try {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      formData.append("category", data.category);
      formData.append("quantity", data.quantity);
      formData.append("pricePerUnit", data.pricePerUnit);
      formData.append("district", data.district);
      formData.append("harvestDate", data.harvestDate);
      formData.append("unit", data.unit);
      
      if (data.description?.trim()) {
        formData.append("description", data.description.trim());
      }

      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      } else {
        setError("image", {
          type: "manual",
          message: t.addProduct.errors.imageRequired,
        });
        return;
      }

      await dispatch(addProduct(formData)).unwrap()
      router.push("/my-products");
    } catch (err: any) {
      console.error("❌ Submission Error:", err);
      setServerError(err.message || t.addProduct.serverError);
    }
  };

  const onError = (formErrors: FieldErrors<ProductFormValues>) => {
    console.warn("⚠️ Form Validation Failed! Errors:", formErrors);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-emerald-100/70 via-emerald-50/30 to-slate-50 pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-150 h-100 bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] bg-size-[24px_24px] opacity-[0.08] pointer-events-none" />

      <motion.div
        className="absolute top-20 left-[6%] text-emerald-400/30 hidden lg:block"
        animate={{ y: [0, -16, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Leaf size={72} strokeWidth={1.2} />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-[6%] text-teal-400/30 hidden lg:block"
        animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Sprout size={90} strokeWidth={1.2} />
      </motion.div>

      <div className="relative max-w-3xl mx-auto px-6 py-14 z-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >

          <span className="inline-block rounded-full bg-emerald-100/80 border border-emerald-200 px-4 py-1 text-xs font-semibold text-emerald-800 mb-3 shadow-sm">
            {t.addProduct.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
            {t.addProduct.title}
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {t.addProduct.subtitle}
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          className="rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur-md shadow-xl shadow-emerald-900/5 p-6 sm:p-8 space-y-6"
        >
          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.addProduct.fields.image.label}
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
                errors.image
                  ? "border-red-300 bg-red-50/40"
                  : dragActive
                  ? "border-emerald-500 bg-emerald-50/80 scale-[1.005]"
                  : "border-slate-200 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30"
              }`}
            >
              {imagePreview ? (
                <div className="relative p-3">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-52 object-cover rounded-xl border border-slate-100"
                  />
                  <div className="flex items-center justify-between mt-3 px-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      {t.addProduct.fields.image.change}
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X size={14} />
                      {t.addProduct.fields.image.remove}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-10 px-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center shadow-sm">
                    <ImagePlus size={22} className="text-emerald-700" />
                  </div>
                  <p className="text-sm text-slate-600">
                    {t.addProduct.fields.image.dragText}{" "}
                    <span className="font-semibold text-emerald-700 underline underline-offset-2">
                      {t.addProduct.fields.image.browseText}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.addProduct.fields.image.requirements}
                  </p>
                </button>
              )}

              <input
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                ref={(e) => {
                  fileInputRef.current = e;
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  processAndSetFile(file);
                }}
              />
              {/* React Hook Form Sync Hidden Register */}
              <input
                type="hidden"
                {...register("image", {
                  required: t.addProduct.errors.imageRequired,
                })}
              />
            </div>
            {errors.image && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.image.message as string}
              </p>
            )}
          </div>

          {/* Product name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              {t.addProduct.fields.name.label}
            </label>
            <div className="relative">
              <Package
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="name"
                type="text"
                placeholder={t.addProduct.fields.name.placeholder}
                {...register("name", {
                  required: t.addProduct.errors.nameRequired,
                  validate: (v) =>
                    v.trim().length > 0 || t.addProduct.errors.nameRequired,
                })}
                className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 ${
                  errors.name
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Category + Quantity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t.addProduct.fields.category.label}
              </label>
              <div className="relative">
                <Tags
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <select
                  id="category"
                  defaultValue=""
                  {...register("category", {
                    required: t.addProduct.errors.categoryRequired,
                  })}
                  className={`w-full appearance-none rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 ${
                    errors.category
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                >
                  <option value="" disabled className="text-slate-400">
                    {t.addProduct.fields.category.placeholder}
                  </option>
                  {CATEGORY_VALUES.map((value, i) => (
                    <option key={value} value={value}>
                      {t.addProduct.categories[i] ?? value}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t.addProduct.fields.quantity.label}
              </label>
              <div className="relative">
                <Hash
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  placeholder={t.addProduct.fields.quantity.placeholder}
                  {...register("quantity", {
                    required: t.addProduct.errors.quantityRequired,
                    validate: (v) =>
                      (Number.isInteger(Number(v)) && Number(v) >= 1) ||
                      t.addProduct.errors.quantityMin,
                  })}
                  className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 ${
                    errors.quantity
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                />
              </div>
              {errors.quantity && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Unit + Price */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t.addProduct.fields.unit.label}
              </label>
              <select
                id="unit"
                defaultValue=""
                {...register("unit", {
                  required: t.addProduct.errors.unitRequired,
                })}
                className={`w-full appearance-none rounded-xl border bg-slate-50/50 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 ${
                  errors.unit
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              >
                <option value="" disabled className="text-slate-400">
                  {t.addProduct.fields.unit.label}
                </option>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {t.addProduct.units[unit as keyof typeof t.addProduct.units]}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.unit.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="pricePerUnit"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t.addProduct.fields.pricePerUnit.label}
              </label>
              <div className="relative">
                <Coins
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="pricePerUnit"
                  type="number"
                  min={0.1}
                  step={0.01}
                  placeholder={t.addProduct.fields.pricePerUnit.placeholder}
                  {...register("pricePerUnit", {
                    required: t.addProduct.errors.priceRequired,
                    validate: (v) =>
                      Number(v) >= 0.1 || t.addProduct.errors.priceMin,
                  })}
                  className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 ${
                    errors.pricePerUnit
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                />
              </div>
              {errors.pricePerUnit && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.pricePerUnit.message}
                </p>
              )}
            </div>
          </div>

          {/* District + Harvest date */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="district"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t.addProduct.fields.district.label}
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <select
                  id="district"
                  defaultValue=""
                  {...register("district", {
                    required: t.addProduct.errors.districtRequired,
                    validate: (v) =>
                      DISTRICTS.includes(v) ||
                      t.addProduct.errors.districtInvalid,
                  })}
                  className={`w-full appearance-none rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 ${
                    errors.district
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                >
                  <option value="" disabled className="text-slate-400">
                    {t.addProduct.fields.district.placeholder}
                  </option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              {errors.district && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.district.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="harvestDate"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                {t.addProduct.fields.harvestDate.label}
              </label>
              <div className="relative">
                <CalendarDays
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <input
                  id="harvestDate"
                  type="date"
                  {...register("harvestDate", {
                    required: t.addProduct.errors.harvestDateRequired,
                    validate: (v) =>
                      !isNaN(new Date(v).getTime()) ||
                      t.addProduct.errors.harvestDateInvalid,
                  })}
                  className={`w-full rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 ${
                    errors.harvestDate
                      ? "border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                />
              </div>
              {errors.harvestDate && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.harvestDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700"
              >
                {t.addProduct.fields.description.label}
              </label>
              <span
                className={`text-xs ${
                  description.length > MAX_DESCRIPTION_LENGTH
                    ? "text-red-500 font-medium"
                    : "text-slate-400"
                }`}
              >
                {MAX_DESCRIPTION_LENGTH - description.length}{" "}
                {t.addProduct.fields.description.charsRemaining}
              </span>
            </div>
            <div className="relative">
              <AlignLeft
                size={18}
                className="absolute left-3.5 top-3.5 text-slate-400"
              />
              <textarea
                id="description"
                rows={4}
                placeholder={t.addProduct.fields.description.placeholder}
                {...register("description", {
                  maxLength: {
                    value: MAX_DESCRIPTION_LENGTH,
                    message: t.addProduct.errors.descriptionMax,
                  },
                })}
                className={`w-full resize-none rounded-xl border bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:bg-white focus:ring-2 ${
                  errors.description
                    ? "border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 font-medium">
              {serverError}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition duration-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t.addProduct.submittingButton
              : t.addProduct.submitButton}
            {!isSubmitting && <ArrowRight size={16} />}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
}