"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
    Wallet,
    ShoppingBag,
    Warehouse,
    CheckCircle2,
    PackageX,
    AlertTriangle,
    ShoppingCart,
    Clock,
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
import { getAratdarDashboard } from "@/store/slice/dashboardSlice"
import { AppDispatch, RootState } from "@/store/store"
import { MONTH_LABELS } from "@/constants/constantValues"
import { toast } from "react-toastify"

/*  Routes (change these if your routes are different)                        */

const ROUTES = {
    inventory: "/aratdar/inventory",
    purchases: "/aratdar/order/placed",
    sales: "/aratdar/order/received",
}

const GREEN = "#16a34a"
const BLUE = "#3b82f6"
const AMBER = "#f59e0b"
const RED = "#ef4444"

const ORDER_STATUS_COLORS: Record<string, string> = {
    PENDING: "#f59e0b",
    CONFIRMED: "#0d9488",
    PROCESSING: "#3b82f6",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#16a34a",
    CANCELLED: "#ef4444",
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

/*  Small building blocks*/

interface StatCardProps {
    label: string
    value: string
    icon: React.ReactNode
    index: number
    highlight?: boolean
    tone?: "default" | "warning"
}

const StatCard = ({ label, value, icon, index, highlight, tone = "default" }: StatCardProps) => {
    const iconBox = highlight
        ? "bg-white/20 text-white"
        : tone === "warning"
            ? "bg-amber-100 text-amber-600"
            : "bg-[#16a34a]/10 text-[#16a34a]"

    return (
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
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBox}`}>{icon}</div>
            <div className="min-w-0">
                <p className={`truncate text-sm ${highlight ? "text-white/85" : "text-gray-600"}`}>{label}</p>
                <p className={`truncate text-2xl font-semibold ${highlight ? "text-white" : "text-gray-900"}`}>
                    {value}
                </p>
            </div>
        </motion.div>
    )
}

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

const ChartLegend = ({ items }: { items: { name: string; color: string }[] }) => (
    <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        {items.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
            </div>
        ))}
    </div>
)

const ChartTooltip = ({ active, payload, label, format }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="min-w-40 rounded-xl bg-white px-3 py-2 text-sm shadow-lg ring-1 ring-black/10">
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
    center,
}: {
    data: DonutItem[]
    emptyText: string
    nf: (n: number) => string
    center?: string // text in the middle (defaults to the total)
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
                    <span className="text-2xl font-bold text-gray-900">{center ?? nf(total)}</span>
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

interface OrderRowProps {
    image?: string
    name: string
    subtitle: string
    quantityText: string
    amountText: string
    statusLabel: string
    statusColor: string
}

const OrderRow = ({ image, name, subtitle, quantityText, amountText, statusLabel, statusColor }: OrderRowProps) => (
    <li className="flex items-center gap-3 py-3">
        <Thumb src={image} alt={name} size={44} />
        <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-gray-900">{name}</p>
            <p className="truncate text-xs text-gray-600">{subtitle}</p>
            <p className="text-xs text-gray-500">{quantityText}</p>
        </div>
        <div className="shrink-0 text-right">
            <p className="font-semibold text-gray-900">{amountText}</p>
            <span
                className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: `${statusColor}1A`, color: statusColor }}
            >
                {statusLabel}
            </span>
        </div>
    </li>
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

/*  Page */

const AratdarDashboardPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { aratdarDashboard, dashboardFetch, dashboardLoading } = useSelector(
        (state: RootState) => state.dashboard
    )
    const { t, locale } = useLanguage()
    const d = t.aratdarDashboard

    const [currentMonth] = useState(() => new Date().getMonth() + 1)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                await dispatch(getAratdarDashboard(null)).unwrap()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
        if (!dashboardFetch) {
            fetchDashboard()
        }
    }, [])

    if (dashboardLoading && !aratdarDashboard) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <LoadingSkeleton />
            </div>
        )
    }

    if (!aratdarDashboard) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <EmptyState text={d.loadFailed} height={300} />
            </div>
        )
    }


    const numLocale = locale === "bn" ? "bn-BD" : "en-US"
    const nf = (n: number) => n.toLocaleString(numLocale)
    const money = (n: number) => `${d.currency}${nf(n)}`
    const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
    const axisMoney = (v: number) => (locale === "bn" ? nf(v) : compact.format(v))
    const months = locale === "bn" ? MONTH_LABELS.bn : MONTH_LABELS.en
    const formatDate = (iso?: string) =>
        iso
            ? new Date(iso).toLocaleDateString(numLocale, { day: "2-digit", month: "short", year: "numeric" })
            : "-"

    const { summary, orderStats, monthlyData, recentPurchases, recentSales, inventoryList } = aratdarDashboard

    // Backend sends all 12 months (future months = 0). Show only Jan -> current month.
    const monthlyChartData = (monthlyData ?? []).slice(0, currentMonth).map((entry, i) => ({
        month: months[i] ?? entry.month,
        purchase: entry.purchase,
        sales: entry.sales,
        purchaseOrders: entry.purchaseOrders,
        salesOrders: entry.salesOrders,
    }))

    // Orders that are not pending/delivered/cancelled (confirmed, processing, shipped)
    const inProgress = Math.max(0, orderStats.total - orderStats.pending - orderStats.delivered - orderStats.cancelled)

    const orderData: DonutItem[] = [
        { name: d.orderStats.pending, value: orderStats.pending, color: ORDER_STATUS_COLORS.PENDING },
        { name: d.orderStats.inProgress, value: inProgress, color: BLUE },
        { name: d.orderStats.delivered, value: orderStats.delivered, color: ORDER_STATUS_COLORS.DELIVERED },
        { name: d.orderStats.cancelled, value: orderStats.cancelled, color: ORDER_STATUS_COLORS.CANCELLED },
    ]

    const totalQty = summary.totalQuantity
    const allocatedQty = summary.totalAllocatedQuantity
    const remainingQty = Math.max(0, totalQty - allocatedQty)
    const usagePercent = totalQty > 0 ? Math.round((allocatedQty / totalQty) * 100) : 0

    const stockData: DonutItem[] = [
        { name: d.stock.allocated, value: allocatedQty, color: AMBER },
        { name: d.stock.remaining, value: remainingQty, color: GREEN },
    ]

    const stats: {
        key: string
        label: string
        value: string
        icon: React.ReactNode
        highlight?: boolean
        tone?: "default" | "warning"
    }[] = [
            { key: "totalSales", label: d.stats.totalSales, value: money(summary.totalSales), icon: <Wallet size={22} />, highlight: true },
            { key: "totalPurchase", label: d.stats.totalPurchase, value: money(summary.totalPurchase), icon: <ShoppingBag size={22} /> },
            { key: "totalInventoryItems", label: d.stats.totalInventoryItems, value: nf(summary.totalInventoryItems), icon: <Warehouse size={22} /> },
            { key: "availableInventoryItems", label: d.stats.availableInventoryItems, value: nf(summary.availableInventoryItems), icon: <CheckCircle2 size={22} /> },
            { key: "depletedInventoryItems", label: d.stats.depletedInventoryItems, value: nf(summary.depletedInventoryItems), icon: <PackageX size={22} /> },
            { key: "lowStockItems", label: d.stats.lowStockItems, value: nf(summary.lowStockItems), icon: <AlertTriangle size={22} />, tone: summary.lowStockItems > 0 ? "warning" : "default" },
            { key: "totalOrders", label: d.stats.totalOrders, value: nf(summary.totalOrders), icon: <ShoppingCart size={22} /> },
            { key: "pendingOrders", label: d.stats.pendingOrders, value: nf(summary.pendingOrders), icon: <Clock size={22} /> },
            { key: "deliveredOrders", label: d.stats.deliveredOrders, value: nf(summary.deliveredOrders), icon: <PackageCheck size={22} /> },
            { key: "cancelledOrders", label: d.stats.cancelledOrders, value: nf(summary.cancelledOrders), icon: <XCircle size={22} /> },
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

    const unitText = (unit: string) => (d.units as Record<string, string>)[unit] ?? unit
    const statusText = (status: string) => (d.orderStatus as Record<string, string>)[status] ?? status

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{d.title}</h1>
                    <p className="mt-1 text-sm text-gray-600">{d.subtitle}</p>
                </div>

                {/* Low stock banner */}
                {summary.lowStockItems > 0 && (
                    <Link
                        href={ROUTES.inventory}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-300 transition hover:ring-amber-400"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <AlertTriangle size={20} />
                            </div>
                            <p className="text-sm text-amber-900">
                                <span className="text-base font-semibold">{nf(summary.lowStockItems)}</span>{" "}
                                {d.lowStockAlert}
                            </p>
                        </div>
                        <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-amber-700">
                            {d.lowStockAlertAction}
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
                            tone={stat.tone}
                        />
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Section title={d.charts.purchaseVsSales}>
                        <ChartLegend
                            items={[
                                { name: d.charts.purchase, color: BLUE },
                                { name: d.charts.sales, color: GREEN },
                            ]}
                        />
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -4, bottom: 0 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...moneyYAxis} />
                                <Tooltip content={<ChartTooltip format={money} />} cursor={{ fill: "#16a34a14" }} />
                                <Bar dataKey="purchase" name={d.charts.purchase} fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={22} />
                                <Bar dataKey="sales" name={d.charts.sales} fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>

                    <Section title={d.charts.orderTrend}>
                        <ChartLegend
                            items={[
                                { name: d.charts.purchaseOrders, color: BLUE },
                                { name: d.charts.salesOrders, color: GREEN },
                            ]}
                        />
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...countYAxis} />
                                <Tooltip content={<ChartTooltip format={nf} />} cursor={{ fill: "#16a34a14" }} />
                                <Bar dataKey="purchaseOrders" name={d.charts.purchaseOrders} fill={BLUE} radius={[6, 6, 0, 0]} maxBarSize={22} />
                                <Bar dataKey="salesOrders" name={d.charts.salesOrders} fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={22} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>

                    <Section title={d.charts.orderStatus}>
                        <DonutChart data={orderData} emptyText={d.noData} nf={nf} />
                    </Section>

                    <Section title={d.charts.stockUsage}>
                        <DonutChart data={stockData} emptyText={d.noData} nf={nf} center={`${nf(usagePercent)}%`} />
                    </Section>
                </div>

                {/* Inventory */}
                <Section title={d.inventory.title} action={<ViewAll href={ROUTES.inventory} label={d.inventory.viewAll} />}>
                    {(inventoryList ?? []).length === 0 ? (
                        <EmptyState text={d.inventory.empty} height={120} />
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {inventoryList.map((item) => {
                                const remaining = Math.max(0, item.totalQuantity - item.allocatedQuantity)
                                const percent =
                                    item.totalQuantity > 0
                                        ? Math.min(100, (item.allocatedQuantity / item.totalQuantity) * 100)
                                        : 0
                                const barColor = percent >= 100 ? RED : percent >= 80 ? AMBER : GREEN
                                const isAvailable = item.status === "available"
                                return (
                                    <div key={item._id} className="rounded-xl bg-[#F3F9F5] p-4 ring-1 ring-black/5">
                                        <div className="flex items-center gap-3">
                                            <Thumb src={item.image?.url} alt={item.productName} size={48} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-gray-900">{item.productName}</p>
                                                <p className="truncate text-xs text-gray-600">
                                                    {item.category} · {money(item.pricePerUnit)}/{unitText(item.unit)}
                                                </p>
                                            </div>
                                            <span
                                                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                                                style={{
                                                    backgroundColor: isAvailable ? "#16a34a1A" : "#ef44441A",
                                                    color: isAvailable ? GREEN : RED,
                                                }}
                                            >
                                                {d.inventory.status[item.status] ?? item.status}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-end justify-between text-sm">
                                            <div>
                                                <p className="text-xs text-gray-600">{d.inventory.allocated}</p>
                                                <p className="font-semibold text-gray-900">
                                                    {nf(item.allocatedQuantity)} / {nf(item.totalQuantity)} {unitText(item.unit)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-600">{d.inventory.remaining}</p>
                                                <p className="font-semibold text-gray-900">
                                                    {nf(remaining)} {unitText(item.unit)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className="h-full rounded-full"
                                                style={{ width: `${percent}%`, backgroundColor: barColor }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Section>

                {/* Recent purchases + sales */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Section
                        title={d.recentPurchases.title}
                        action={<ViewAll href={ROUTES.purchases} label={d.recentPurchases.viewAll} />}
                    >
                        {(recentPurchases ?? []).length === 0 ? (
                            <EmptyState text={d.recentPurchases.empty} height={120} />
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentPurchases.map((order) => (
                                    <OrderRow
                                        key={order._id}
                                        image={order.productId?.image?.url}
                                        name={order.productId?.name ?? "-"}
                                        subtitle={`${order.sellerId?.name ?? "-"} · ${formatDate(order.createdAt)}`}
                                        quantityText={`${nf(order.quantity)} ${unitText(order.unit)} × ${money(order.pricePerUnit)}`}
                                        amountText={money(order.totalAmount)}
                                        statusLabel={statusText(order.status)}
                                        statusColor={ORDER_STATUS_COLORS[order.status] ?? "#64748b"}
                                    />
                                ))}
                            </ul>
                        )}
                    </Section>

                    <Section
                        title={d.recentSales.title}
                        action={<ViewAll href={ROUTES.sales} label={d.recentSales.viewAll} />}
                    >
                        {(recentSales ?? []).length === 0 ? (
                            <EmptyState text={d.recentSales.empty} height={120} />
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentSales.map((order) => (
                                    <OrderRow
                                        key={order._id}
                                        image={order.inventoryId?.image?.url}
                                        name={order.inventoryId?.productName ?? "-"}
                                        subtitle={`${order.buyerId?.name ?? "-"} · ${formatDate(order.createdAt)}`}
                                        quantityText={`${nf(order.quantity)} ${unitText(order.unit)} × ${money(order.pricePerUnit)}`}
                                        amountText={money(order.totalAmount)}
                                        statusLabel={statusText(order.status)}
                                        statusColor={ORDER_STATUS_COLORS[order.status] ?? "#64748b"}
                                    />
                                ))}
                            </ul>
                        )}
                    </Section>
                </div>
            </div>
        </div>
    )
}

export default AratdarDashboardPage