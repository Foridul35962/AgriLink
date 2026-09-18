"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import {
    Users,
    Sprout,
    Warehouse,
    Store,
    Package,
    Boxes,
    Gavel,
    ShoppingCart,
    FileWarning,
    UserPlus,
    ArrowUpRight,
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
import { getAdminDashboard } from "@/store/slice/adminSlice"
import { AppDispatch, RootState } from "@/store/store"
import { MONTH_LABELS } from "@/constants/constantValues"
import { toast } from "react-toastify"

//colour
const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    completed: "#16a34a",
    delivered: "#16a34a",
    cancelled: "#ef4444",
    rejected: "#ef4444",
}
const DEFAULT_STATUS_COLOR = "#64748b"

// Each role gets a clearly different color (old greens were too close to each other)
const ROLE_COLORS: Record<string, string> = {
    farmer: "#16a34a",
    aratdar: "#3b82f6",
    retailer: "#f59e0b",
    admin: "#8b5cf6",
}
const DEFAULT_ROLE_COLOR = "#64748b"

// Chart text colors - dark enough to read easily
const AXIS_TEXT = "#374151"
const AXIS_LINE = "#d1d5db"
const GRID_LINE = "#e5e7eb"

const formatStatus = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "-"


interface StatCardProps {
    label: string
    value: number
    icon: React.ReactNode
    index: number
}

const StatCard = ({ label, value, icon, index }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
    >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#16a34a]/10 text-[#16a34a]">
            {icon}
        </div>
        <div className="min-w-0">
            <p className="truncate text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        </div>
    </motion.div>
)

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <h3 className="mb-4 text-base font-semibold text-gray-900">{title}</h3>
        {children}
    </div>
)

const EmptyChart = ({ text }: { text: string }) => (
    <div className="flex h-65 items-center justify-center text-sm text-gray-500">{text}</div>
)

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div className="min-w-35 rounded-xl bg-white px-3 py-2 text-sm shadow-lg ring-1 ring-black/10">
            {label && <p className="mb-1 font-semibold text-gray-900">{label}</p>}
            {payload.map((p: any) => (
                <div key={p.dataKey ?? p.name} className="flex items-center gap-2 text-gray-600">
                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: p.payload?.color ?? p.color ?? p.stroke ?? p.fill }}
                    />
                    <span>{p.name}</span>
                    <span className="ml-auto pl-3 font-semibold text-gray-900">
                        {Number(p.value).toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    )
}

const xAxisProps = {
    dataKey: "month",
    tickLine: false,
    axisLine: { stroke: AXIS_LINE },
    tick: { fontSize: 12, fill: AXIS_TEXT, fontWeight: 500 },
    tickMargin: 10,
    interval: 0 as const,
}
const yAxisProps = {
    tickLine: false,
    axisLine: false,
    allowDecimals: false,
    width: 36,
    tick: { fontSize: 12, fill: AXIS_TEXT },
}

interface DonutItem {
    name: string
    value: number
    color: string
}

const DonutChart = ({ data, emptyText }: { data: DonutItem[]; emptyText: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return <EmptyChart text={emptyText} />

    return (
        <div>
            <div className="relative">
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={65}
                            outerRadius={95}
                            paddingAngle={3}
                            stroke="#ffffff"
                            strokeWidth={2}
                        >
                            {data.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</span>
                </div>
            </div>

            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                {data.map((item) => (
                    <li key={item.name} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-gray-700">{item.name}</span>
                        <span className="ml-auto font-semibold text-gray-900">{item.value.toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
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

const AdminDashboardPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { adminLoading, dashboardData } = useSelector((state: RootState) => state.admin)
    const { t, locale } = useLanguage()

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                await dispatch(getAdminDashboard(null)).unwrap()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
        if (dashboardData.totalUsers === 0) {
            fetchDashboard()
        }
    }, [])

    if (adminLoading && dashboardData.totalUsers === 0) {
        return (
            <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
                <LoadingSkeleton />
            </div>
        )
    }

    const noDataText = locale === "bn" ? "কোনো তথ্য নেই" : "No data yet"
    const months = locale === "bn" ? MONTH_LABELS.bn : MONTH_LABELS.en
    const charts = dashboardData.charts

    const currentMonth = new Date().getMonth() + 1
    const usersByMonth = new Map<number, number>(
        (charts?.monthlyUsers ?? []).map((e: any) => [Number(e._id), e.count])
    )
    const ordersByMonth = new Map<number, number>(
        (charts?.monthlyOrders ?? []).map((e: any) => [Number(e._id), e.count])
    )

    const monthlyChartData = Array.from({ length: currentMonth }, (_, i) => ({
        month: months[i] ?? String(i + 1),
        users: usersByMonth.get(i + 1) ?? 0,
        orders: ordersByMonth.get(i + 1) ?? 0,
    }))

    const orderStatusData: DonutItem[] = (charts?.orderStatus ?? []).map((entry: any) => ({
        name: formatStatus(entry._id),
        value: entry.count,
        color: STATUS_COLORS[String(entry._id ?? "").toLowerCase()] ?? DEFAULT_STATUS_COLOR,
    }))

    const userRoleData: DonutItem[] = (charts?.userRoles ?? []).map((entry: any) => ({
        name: t.adminDashboard.roles[entry._id as keyof typeof t.adminDashboard.roles] ?? formatStatus(entry._id),
        value: entry.count,
        color: ROLE_COLORS[entry._id] ?? DEFAULT_ROLE_COLOR,
    }))

    const stats: { key: string; label: string; value: number; icon: React.ReactNode }[] = [
        { key: "totalUsers", label: t.adminDashboard.stats.totalUsers, value: dashboardData.totalUsers, icon: <Users size={22} /> },
        { key: "farmers", label: t.adminDashboard.stats.farmers, value: dashboardData.farmers, icon: <Sprout size={22} /> },
        { key: "aratdars", label: t.adminDashboard.stats.aratdars, value: dashboardData.aratdars, icon: <Warehouse size={22} /> },
        { key: "retailers", label: t.adminDashboard.stats.retailers, value: dashboardData.retailers, icon: <Store size={22} /> },
        { key: "products", label: t.adminDashboard.stats.products, value: dashboardData.products, icon: <Package size={22} /> },
        { key: "inventories", label: t.adminDashboard.stats.inventories, value: dashboardData.inventories, icon: <Boxes size={22} /> },
        { key: "activeAuctions", label: t.adminDashboard.stats.activeAuctions, value: dashboardData.activeAuctions, icon: <Gavel size={22} /> },
        { key: "orders", label: t.adminDashboard.stats.orders, value: dashboardData.orders, icon: <ShoppingCart size={22} /> },
    ]

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t.adminDashboard.title}</h1>
                    <p className="mt-1 text-sm text-gray-600">{t.adminDashboard.subtitle}</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat, index) => (
                        <StatCard key={stat.key} label={stat.label} value={stat.value} icon={stat.icon} index={index} />
                    ))}
                </div>

                {/* Alerts row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        href="/admin/reports"
                        className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:ring-amber-400/60"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <FileWarning size={22} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t.adminDashboard.stats.pendingReports}</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {dashboardData.pendingReports.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <ArrowUpRight size={18} className="text-gray-500" />
                    </Link>

                    <Link
                        href="/admin/members/request"
                        className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:ring-blue-400/60"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                <UserPlus size={22} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">{t.adminDashboard.stats.pendingMemberRequest}</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {dashboardData.pendingMemberRequest.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <ArrowUpRight size={18} className="text-gray-500" />
                    </Link>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* User growth (users only) */}
                    <ChartCard title={t.adminDashboard.charts.userGrowth}>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...yAxisProps} />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#16a34a", strokeOpacity: 0.3 }} />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    name={t.adminDashboard.stats.totalUsers}
                                    stroke="#16a34a"
                                    strokeWidth={2.5}
                                    fill="url(#usersGradient)"
                                    dot={{ r: 3.5, fill: "#16a34a", stroke: "#ffffff", strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Order growth (orders only) */}
                    <ChartCard title={t.adminDashboard.charts.orderGrowth}>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={monthlyChartData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_LINE} />
                                <XAxis {...xAxisProps} />
                                <YAxis {...yAxisProps} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#16a34a14" }} />
                                <Bar
                                    dataKey="orders"
                                    name={t.adminDashboard.stats.orders}
                                    fill="#16a34a"
                                    radius={[8, 8, 0, 0]}
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Order status */}
                    <ChartCard title={t.adminDashboard.charts.orderStatus}>
                        <DonutChart data={orderStatusData} emptyText={noDataText} />
                    </ChartCard>

                    {/* User roles */}
                    <ChartCard title={t.adminDashboard.charts.userRoles}>
                        <DonutChart data={userRoleData} emptyText={noDataText} />
                    </ChartCard>
                </div>

                {/* Recent orders */}
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900">{t.adminDashboard.recentOrders.title}</h3>
                    </div>

                    {dashboardData.recentOrders.length === 0 ? (
                        <p className="py-8 text-center text-sm text-gray-500">{t.adminDashboard.recentOrders.empty}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-600">
                                        <th className="py-2 pr-4 font-medium">{t.adminDashboard.recentOrders.seller}</th>
                                        <th className="py-2 pr-4 font-medium">{t.adminDashboard.recentOrders.buyer}</th>
                                        <th className="py-2 pr-4 font-medium">{t.adminDashboard.recentOrders.status}</th>
                                        <th className="py-2 pr-4 font-medium">{t.adminDashboard.recentOrders.date}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.recentOrders.map((order) => {
                                        const statusColor =
                                            STATUS_COLORS[order.status?.toLowerCase()] ?? DEFAULT_STATUS_COLOR
                                        return (
                                            <tr key={order._id} className="border-b border-gray-100 last:border-0">
                                                <td className="py-3 pr-4 text-gray-800">
                                                    {t.adminDashboard.roles[order.sellerRole] ?? order.sellerRole}
                                                </td>
                                                <td className="py-3 pr-4 text-gray-800">
                                                    {t.adminDashboard.roles[order.buyerRole] ?? order.buyerRole}
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <span
                                                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                                                        style={{ backgroundColor: `${statusColor}1A`, color: statusColor }}
                                                    >
                                                        {formatStatus(order.status)}
                                                    </span>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString(
                                                        locale === "bn" ? "bn-BD" : "en-US",
                                                        { day: "2-digit", month: "short", year: "numeric" }
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboardPage