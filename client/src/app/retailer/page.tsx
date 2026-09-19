"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
    ShoppingBag,
    ShoppingCart,
    Truck,
    PackageCheck,
    XCircle,
    ArrowUpRight,
    Package,
} from "lucide-react"
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts"

import { useLanguage } from "@/context/LanguageContext"
import { getRetailerDashboard } from "@/store/slice/dashboardSlice"
import { AppDispatch, RootState } from "@/store/store"
import { MONTH_LABELS } from "@/constants/constantValues"
import { toast } from "react-toastify"

const ROUTES = {
    orders: "/retailer/order",
}


const GREEN = "#16a34a"
const BLUE = "#3b82f6"

const ORDER_STATUS_COLORS: Record<string, string> = {
    PENDING: "#f59e0b",
    CONFIRMED: "#0d9488",
    PROCESSING: "#3b82f6",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#16a34a",
    CANCELLED: "#ef4444",
}

// Order of the normal delivery flow (used for the per-order progress tracker)
const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const
// All statuses in display order (used for the donut chart)
const ALL_STATUSES = [...STATUS_STEPS, "CANCELLED"] as const

// Chart text colors (dark enough to read clearly)
const AXIS_TEXT = "#374151"
const AXIS_LINE = "#d1d5db"
const GRID_LINE = "#e5e7eb"

/* Do NOT pass `stroke` to axes: recharts also applies it to the tick text,
   which makes labels look blurry. Text color goes in tick.fill instead. */
const xAxisProps = {
    dataKey: "month",
    tickLine: false,
    axisLine: { stroke: AXIS_LINE },
    tick: { fontSize: 12, fill: AXIS_TEXT, fontWeight: 500 },
    tickMargin: 10,
    interval: 0 as const,
}

/*  Small building blocks                                                     */

interface StatCardProps {
    label: string
    value: string
    icon: React.ReactNode
    index: number
    highlight?: boolean
}

const StatCard = ({ label, value, icon, index, highlight }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className={
            highlight
                ? "flex items-center gap-4 rounded-2xl bg-[#16a34a] p-5 text-white shadow-sm"
                : "flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
        }
    >
        <div
            className={
                highlight
                    ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white"
                    : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#16a34a]/10 text-[#16a34a]"
            }
        >
            {icon}
        </div>
        <div className="min-w-0">
            <p className={`truncate text-sm ${highlight ? "text-white/85" : "text-gray-600"}`}>{label}</p>
            <p className={`truncate text-2xl font-semibold ${highlight ? "text-white" : "text-gray-900"}`}>
                {value}
            </p>
        </div>
    </motion.div>
)

const Section = ({
    title,
    action,
    children,
    className = "",
}: {
    title: string
    action?: React.ReactNode
    children: React.ReactNode
    className?: string
}) => (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 ${className}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {action}
        </div>
        {children}
    </div>
)

const ViewAll = ({ href, label }: { href: string; label: string }) => (
    <Link href={href} className="flex items-center gap-1 text-sm font-medium text-[#16a34a] hover:underline">
        {label}
        <ArrowUpRight size={14} />
    </Link>
)

const EmptyState = ({ text, height = 260 }: { text: string; height?: number }) => (
    <div className="flex items-center justify-center text-center text-sm text-gray-500" style={{ height }}>
        {text}
    </div>
)

const ChartTooltip = ({ active, payload, label, format }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="min-w-37.5 rounded-xl bg-white px-3 py-2 text-sm shadow-lg ring-1 ring-black/10">
            {label && <p className="mb-1 font-semibold text-gray-900">{label}</p>}
            {payload.map((p: any) => (
                <div key={p.dataKey ?? p.name} className="flex items-center gap-2 text-gray-600">
                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: p.payload?.color ?? p.color ?? p.stroke ?? p.fill }}
                    />
                    <span>{p.name}</span>
                    <span className="ml-auto pl-3 font-semibold text-gray-900">
                        {format ? format(Number(p.value)) : Number(p.value).toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}

interface DonutItem {
    name: string
    value: number
    color: string
}

const DonutChart = ({
    data,
    emptyText,
    nf,
}: {
    data: DonutItem[]
    emptyText: string
    nf: (n: number) => string
}) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return <EmptyState text={emptyText} />
    const visible = data.filter((d) => d.value > 0)

    return (
        <div>
            <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={visible}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={visible.length > 1 ? 3 : 0}
                            stroke="#ffffff"
                            strokeWidth={2}
                        >
                            {visible.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip format={nf} />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{nf(total)}</span>
                </div>
            </div>

            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                {data.map((item) => (
                    <li key={item.name} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-gray-700">{item.name}</span>
                        <span className="ml-auto font-semibold text-gray-900">{nf(item.value)}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const Thumb = ({ src, alt, size = 40 }: { src?: string; alt: string; size?: number }) =>
    src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="shrink-0 rounded-lg bg-gray-100 object-cover"
            style={{ width: size, height: size }}
        />
    ) : (
        <div
            className="flex shrink-0 items-center justify-center rounded-lg bg-[#16a34a]/10 text-[#16a34a]"
            style={{ width: size, height: size }}
        >
            <Package size={size / 2} />
        </div>
    )

/* Small 5-segment progress bar: Pending -> Confirmed -> Processing -> Shipped -> Delivered.
   Cancelled orders show all segments in red. */
const OrderTracker = ({
    status,
    labels,
}: {
    status: string
    labels: Record<string, string>
}) => {
    const cancelled = status === "CANCELLED"
    const currentIndex = STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number])
    const color = ORDER_STATUS_COLORS[status] ?? "#64748b"

    return (
        <div className="flex gap-1.5">
            {STATUS_STEPS.map((step, i) => {
                const filled = cancelled || i <= currentIndex
                return (
                    <div
                        key={step}
                        title={labels[step]}
                        className="h-1.5 flex-1 rounded-full"
                        style={{ backgroundColor: filled ? color : "#e5e7eb", opacity: cancelled ? 0.5 : 1 }}
                    />
                )
            })}
        </div>
    )
}

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.05 }}
                    className="h-24 rounded-2xl bg-white ring-1 ring-black/5"
                />
            ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                    className="h-80 rounded-2xl bg-white ring-1 ring-black/5"
                />
            ))}
        </div>
        <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="h-96 rounded-2xl bg-white ring-1 ring-black/5"
        />
    </div>
)

/*  Page                                                                      */

const RetailerDashboardPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { retailerDashboard, dashboardFetch, dashboardLoading } = useSelector(
        (state: RootState) => state.dashboard
    )
    const { t, locale } = useLanguage()
    const d = t.retailerDashboard

    const [currentMonth] = useState(() => new Date().getMonth() + 1)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                await dispatch(getRetailerDashboard(null)).unwrap()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
        if (!dashboardFetch) {
            fetchDashboard()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (dashboardLoading && !retailerDashboard) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <LoadingSkeleton />
            </div>
        )
    }

    if (!retailerDashboard) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <EmptyState text={d.loadFailed} height={300} />
            </div>
        )
    }

    /* ------------------------------ formatting ------------------------------ */

    const numLocale = locale === "bn" ? "bn-BD" : "en-US"
    const nf = (n: number) => n.toLocaleString(numLocale)
    const money = (n: number) => `${d.currency}${nf(n)}`
    const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
    // English gets short labels (12K); Bangla keeps full grouped digits to avoid odd abbreviations
    const axisMoney = (v: number) => (locale === "bn" ? nf(v) : compact.format(v))
    const months = locale === "bn" ? MONTH_LABELS.bn : MONTH_LABELS.en
    const formatDate = (iso?: string) =>
        iso
            ? new Date(iso).toLocaleDateString(numLocale, { day: "2-digit", month: "short", year: "numeric" })
            : "-"

    const { summary, orderStats, monthlyData, recentOrders } = retailerDashboard

    // Backend sends all 12 months (future months = 0). Show only Jan -> current month.
    const monthlyChartData = (monthlyData ?? []).slice(0, currentMonth).map((entry, i) => ({
        month: months[i] ?? entry.month,
        purchase: entry.purchase,
        purchaseOrders: entry.purchaseOrders,
    }))

    const inProgress =
        summary.pendingOrders + summary.confirmedOrders + summary.processingOrders + summary.shippedOrders

    const statusLabels = d.orderStatus as Record<string, string>
    const unitText = (unit: string) => (d.units as Record<string, string>)[unit] ?? unit

    const orderData: DonutItem[] = ALL_STATUSES.map((status) => ({
        name: statusLabels[status],
        value: orderStats[status.toLowerCase() as keyof typeof orderStats] as number,
        color: ORDER_STATUS_COLORS[status],
    }))

    const stats: { key: string; label: string; value: string; icon: React.ReactNode; highlight?: boolean }[] = [
        { key: "totalPurchase", label: d.stats.totalPurchase, value: money(summary.totalPurchase), icon: <ShoppingBag size={22} />, highlight: true },
        { key: "totalOrders", label: d.stats.totalOrders, value: nf(summary.totalOrders), icon: <ShoppingCart size={22} /> },
        { key: "inProgress", label: d.stats.inProgressOrders, value: nf(inProgress), icon: <Truck size={22} /> },
        { key: "delivered", label: d.stats.deliveredOrders, value: nf(summary.deliveredOrders), icon: <PackageCheck size={22} /> },
        { key: "cancelled", label: d.stats.cancelledOrders, value: nf(summary.cancelledOrders), icon: <XCircle size={22} /> },
    ]

    const moneyYAxis = {
        tickLine: false,
        axisLine: false,
        allowDecimals: false,
        width: locale === "bn" ? 64 : 48,
        tick: { fontSize: 12, fill: AXIS_TEXT },
        tickFormatter: axisMoney,
    }
    const countYAxis = {
        tickLine: false,
        axisLine: false,
        allowDecimals: false,
        width: 36,
        tick: { fontSize: 12, fill: AXIS_TEXT },
        tickFormatter: (v: number) => nf(v),
    }

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{d.title}</h1>
                    <p className="mt-1 text-sm text-gray-600">{d.subtitle}</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.key}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            index={index}
                            highlight={stat.highlight}
                        />
                    ))}
                </div>

                {/* Monthly charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Section title={d.charts.purchaseTrend}>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...moneyYAxis} />
                                <Tooltip content={<ChartTooltip format={money} />} cursor={{ fill: "#16a34a14" }} />
                                <Bar
                                    dataKey="purchase"
                                    name={d.charts.purchase}
                                    fill={GREEN}
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>

                    <Section title={d.charts.orderTrend}>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...countYAxis} />
                                <Tooltip content={<ChartTooltip format={nf} />} cursor={{ fill: "#3b82f614" }} />
                                <Bar
                                    dataKey="purchaseOrders"
                                    name={d.charts.orders}
                                    fill={BLUE}
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>
                </div>

                {/* Order status donut + recent orders with progress trackers */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Section title={d.charts.orderStatus} className="lg:col-span-1">
                        <DonutChart data={orderData} emptyText={d.noData} nf={nf} />
                    </Section>

                    <Section
                        title={d.recentOrders.title}
                        action={<ViewAll href={ROUTES.orders} label={d.recentOrders.viewAll} />}
                        className="lg:col-span-2"
                    >
                        {(recentOrders ?? []).length === 0 ? (
                            <EmptyState text={d.recentOrders.empty} height={160} />
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentOrders.map((order) => {
                                    const color = ORDER_STATUS_COLORS[order.status] ?? "#64748b"
                                    return (
                                        <li key={order._id} className="py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <Thumb
                                                    src={order.inventoryId?.image?.url}
                                                    alt={order.inventoryId?.productName ?? ""}
                                                    size={48}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-gray-900">
                                                        {order.inventoryId?.productName ?? "-"}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-600">
                                                        {order.sellerId?.name ?? "-"} · {formatDate(order.createdAt)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {nf(order.quantity)} {unitText(order.unit)} × {money(order.pricePerUnit)}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className="font-semibold text-gray-900">{money(order.totalAmount)}</p>
                                                    <span
                                                        className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                        style={{ backgroundColor: `${color}1A`, color }}
                                                    >
                                                        {statusLabels[order.status] ?? order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <OrderTracker status={order.status} labels={statusLabels} />
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    )
}

export default RetailerDashboardPage