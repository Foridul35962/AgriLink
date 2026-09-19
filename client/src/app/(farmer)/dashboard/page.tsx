"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
    Sprout,
    Leaf,
    ShoppingCart,
    Clock,
    PackageCheck,
    Wallet,
    Gavel,
    Timer,
    Hourglass,
    BadgeCheck,
    ArrowUpRight,
    Package,
} from "lucide-react"
import {
    ResponsiveContainer,
    AreaChart,
    Area,
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
import { getfarmerDashboard } from "@/store/slice/dashboardSlice"
import { AppDispatch, RootState } from "@/store/store"
import { MONTH_LABELS } from "@/constants/constantValues"
import { toast } from "react-toastify"

/* -------------------------------------------------------------------------- */
/*  Colors                                                                    */
/* -------------------------------------------------------------------------- */

const GREEN = "#16a34a"

const ORDER_STATUS_COLORS: Record<string, string> = {
    PENDING: "#f59e0b",
    CONFIRMED: "#0d9488",
    PROCESSING: "#3b82f6",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#16a34a",
    CANCELLED: "#ef4444",
}

const CROP_COLORS = {
    available: "#16a34a",
    sold: "#3b82f6",
    expired: "#ef4444",
}

const ORDER_STAT_COLORS = {
    pending: "#f59e0b",
    delivered: "#16a34a",
    cancelled: "#ef4444",
}

// Chart text colors (dark enough to read clearly)
const AXIS_TEXT = "#374151"
const AXIS_LINE = "#d1d5db"
const GRID_LINE = "#e5e7eb"

const xAxisProps = {
    dataKey: "month",
    tickLine: false,
    axisLine: { stroke: AXIS_LINE },
    tick: { fontSize: 12, fill: AXIS_TEXT, fontWeight: 500 },
    tickMargin: 10,
    interval: 0 as const,
}

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
}: {
    title: string
    action?: React.ReactNode
    children: React.ReactNode
}) => (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
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

    return (
        <div>
            <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data.filter((d) => d.value > 0)}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={3}
                            stroke="#ffffff"
                            strokeWidth={2}
                        >
                            {data
                                .filter((d) => d.value > 0)
                                .map((item) => (
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

            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
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

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.05 }}
                    className="h-24 rounded-2xl bg-white ring-1 ring-black/5"
                />
            ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.1 }}
                    className="h-80 rounded-2xl bg-white ring-1 ring-black/5"
                />
            ))}
        </div>
    </div>
)

//  Page

const FarmerDashboardPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { dashboardFetch, dashboardLoading, farmerDashboard } = useSelector(
        (state: RootState) => state.dashboard
    )
    const { t, locale } = useLanguage()
    const d = t.farmerDashboard

    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                await dispatch(getfarmerDashboard(null)).unwrap()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
        if (!dashboardFetch) {
            fetchDashboard()
        }
    }, [])

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 30000)
        return () => clearInterval(id)
    }, [])

    if (dashboardLoading && !farmerDashboard) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <LoadingSkeleton />
            </div>
        )
    }

    if (!farmerDashboard) {
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
    const compact = new Intl.NumberFormat(numLocale, { notation: "compact", maximumFractionDigits: 1 })
    const months = locale === "bn" ? MONTH_LABELS.bn : MONTH_LABELS.en

    const { summary, cropStats, orderStats, monthlyData, recentOrders, activeAuctions } = farmerDashboard

    const currentMonth = new Date(now).getMonth() + 1
    const monthlyChartData = (monthlyData ?? []).slice(0, currentMonth).map((entry, i) => ({
        month: months[i] ?? entry.month,
        sales: entry.sales,
        orders: entry.orders,
    }))

    const cropData: DonutItem[] = [
        { name: d.cropStats.available, value: cropStats.available, color: CROP_COLORS.available },
        { name: d.cropStats.sold, value: cropStats.sold, color: CROP_COLORS.sold },
        { name: d.cropStats.expired, value: cropStats.expired, color: CROP_COLORS.expired },
    ]

    const orderData: DonutItem[] = [
        { name: d.orderStats.pending, value: orderStats.pending, color: ORDER_STAT_COLORS.pending },
        { name: d.orderStats.delivered, value: orderStats.delivered, color: ORDER_STAT_COLORS.delivered },
        { name: d.orderStats.cancelled, value: orderStats.cancelled, color: ORDER_STAT_COLORS.cancelled },
    ]

    const stats: { key: string; label: string; value: string; icon: React.ReactNode; highlight?: boolean }[] = [
        { key: "totalSales", label: d.stats.totalSales, value: money(summary.totalSales), icon: <Wallet size={22} />, highlight: true },
        { key: "totalCrops", label: d.stats.totalCrops, value: nf(summary.totalCrops), icon: <Sprout size={22} /> },
        { key: "availableCrops", label: d.stats.availableCrops, value: nf(summary.availableCrops), icon: <Leaf size={22} /> },
        { key: "totalOrders", label: d.stats.totalOrders, value: nf(summary.totalOrders), icon: <ShoppingCart size={22} /> },
        { key: "pendingOrders", label: d.stats.pendingOrders, value: nf(summary.pendingOrders), icon: <Clock size={22} /> },
        { key: "deliveredOrders", label: d.stats.deliveredOrders, value: nf(summary.deliveredOrders), icon: <PackageCheck size={22} /> },
        { key: "totalAuctions", label: d.stats.totalAuctions, value: nf(summary.totalAuctions), icon: <Gavel size={22} /> },
        { key: "activeAuctions", label: d.stats.activeAuctions, value: nf(summary.activeAuctions), icon: <Timer size={22} /> },
        { key: "waiting", label: d.stats.waitingAuctionSelection, value: nf(summary.waitingAuctionSelection), icon: <Hourglass size={22} /> },
        { key: "completedAuctions", label: d.stats.completedAuctions, value: nf(summary.completedAuctions), icon: <BadgeCheck size={22} /> },
    ]

    const timeLeft = (end: string) => {
        const diff = new Date(end).getTime() - now
        if (diff <= 0) return null
        const totalMin = Math.floor(diff / 60000)
        return `${nf(Math.floor(totalMin / 60))}${d.auctions.hourShort} ${nf(totalMin % 60)}${d.auctions.minShort}`
    }

    const progress = (start: string, end: string) => {
        const s = new Date(start).getTime()
        const e = new Date(end).getTime()
        if (e <= s) return 100
        return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100))
    }

    const salesYAxis = {
        tickLine: false,
        axisLine: false,
        allowDecimals: false,
        width: 48,
        tick: { fontSize: 12, fill: AXIS_TEXT },
        tickFormatter: (v: number) => compact.format(v),
    }
    const ordersYAxis = {
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

                {/* Attention banner: auctions that ended and need a winner */}
                {summary.waitingAuctionSelection > 0 && (
                    <Link
                        href="/farmer/auctions"
                        className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300 transition hover:ring-amber-400"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <Hourglass size={20} />
                            </div>
                            <p className="text-sm text-amber-900">
                                <span className="text-base font-semibold">{nf(summary.waitingAuctionSelection)}</span>{" "}
                                {d.waitingAlert}
                            </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber-700">
                            {d.waitingAlertAction}
                            <ArrowUpRight size={14} />
                        </span>
                    </Link>
                )}

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

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Section title={d.charts.salesTrend}>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={GREEN} stopOpacity={0.35} />
                                        <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...salesYAxis} />
                                <Tooltip
                                    content={<ChartTooltip format={money} />}
                                    cursor={{ stroke: GREEN, strokeOpacity: 0.3 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    name={d.charts.sales}
                                    stroke={GREEN}
                                    strokeWidth={2.5}
                                    fill="url(#salesGradient)"
                                    dot={{ r: 3.5, fill: GREEN, stroke: "#ffffff", strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Section>

                    <Section title={d.charts.orderTrend}>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...ordersYAxis} />
                                <Tooltip content={<ChartTooltip format={nf} />} cursor={{ fill: "#16a34a14" }} />
                                <Bar
                                    dataKey="orders"
                                    name={d.charts.orders}
                                    fill={GREEN}
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>

                    <Section title={d.charts.cropStatus}>
                        <DonutChart data={cropData} emptyText={d.noData} nf={nf} />
                    </Section>

                    <Section title={d.charts.orderStatus}>
                        <DonutChart data={orderData} emptyText={d.noData} nf={nf} />
                    </Section>
                </div>

                {/* Live auctions */}
                <Section title={d.auctions.title}>
                    {(activeAuctions ?? []).length === 0 ? (
                        <EmptyState text={d.auctions.empty} height={120} />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {activeAuctions.map((auction) => {
                                const remaining = timeLeft(auction.endTime)
                                const hasBids = Boolean(auction.highestBidder)
                                return (
                                    <div key={auction._id} className="rounded-xl bg-[#F3F9F5] p-4 ring-1 ring-black/5">
                                        <div className="flex items-center gap-3">
                                            <Thumb src={auction.productImage} alt={auction.productName} size={48} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-gray-900">
                                                    {auction.productName}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {d.auctions.startPrice}: {money(auction.startPrice)}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-[#16a34a]/10 px-2.5 py-1 text-xs font-medium text-[#16a34a]">
                                                {remaining ?? d.auctions.ended}
                                            </span>
                                        </div>

                                        <div className="mt-4">
                                            <p className="text-xs text-gray-600">{d.auctions.highestBid}</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {hasBids ? money(auction.currentHighestBid) : d.auctions.noBids}
                                            </p>
                                        </div>

                                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className="h-full rounded-full bg-[#16a34a]"
                                                style={{ width: `${progress(auction.startTime, auction.endTime)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Section>

                {/* Recent orders */}
                <Section
                    title={d.recentOrders.title}
                    action={<ViewAll href="/receive-order" label={d.recentOrders.viewAll} />}
                >
                    {(recentOrders ?? []).length === 0 ? (
                        <EmptyState text={d.recentOrders.empty} height={120} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-160 text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-600">
                                        <th className="py-2 pr-4 font-medium">{d.recentOrders.product}</th>
                                        <th className="py-2 pr-4 font-medium">{d.recentOrders.buyer}</th>
                                        <th className="py-2 pr-4 font-medium">{d.recentOrders.quantity}</th>
                                        <th className="py-2 pr-4 font-medium">{d.recentOrders.amount}</th>
                                        <th className="py-2 pr-4 font-medium">{d.recentOrders.status}</th>
                                        <th className="py-2 pr-4 font-medium">{d.recentOrders.date}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => {
                                        const color = ORDER_STATUS_COLORS[order.status] ?? "#64748b"
                                        return (
                                            <tr key={order._id} className="border-b border-gray-100 last:border-0">
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <Thumb src={order.productId?.image?.url} alt={order.productId?.name ?? ""} />
                                                        <span className="font-medium text-gray-900">
                                                            {order.productId?.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <p className="text-gray-800">{order.buyerId?.name}</p>
                                                    <p className="text-xs text-gray-500">{order.buyerId?.phone}</p>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-800">
                                                    {nf(order.quantity)} {d.units[order.unit] ?? order.unit}
                                                </td>
                                                <td className="py-3 pr-4 font-semibold text-gray-900">
                                                    {money(order.totalAmount)}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span
                                                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                                                        style={{ backgroundColor: `${color}1A`, color }}
                                                    >
                                                        {d.orderStatus[order.status] ?? order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString(numLocale, {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Section>
            </div>
        </div>
    )
}

export default FarmerDashboardPage