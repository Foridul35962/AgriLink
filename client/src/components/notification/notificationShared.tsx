"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import {
    Bell,
    ShoppingCart,
    CheckCircle2,
    Truck,
    PackageCheck,
    XCircle,
    Wallet,
    RotateCcw,
    BadgeCheck,
    Ban,
    AlertTriangle,
    PackageX,
    RefreshCw,
    FileWarning,
    ShieldCheck,
    Heart,
    MessageCircle,
    Megaphone,
    ShieldAlert,
    Tag,
    Check,
    Trash2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { AppDispatch } from "@/store/store"
import {
    deleteNotification,
    deleteNotificationPrev,
    readAllNotification,
    readNotification,
} from "@/store/slice/notificationSlice"
import type { Notification } from "@/types/notificationTypes"

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

export const NOTIFICATIONS_ROUTE = "/notifications"

/* Where should a notification take the user when clicked?
   Return a path to make the item a link, or null to just mark it as read.
   Example:
     if (n.type.toLowerCase().includes("order") && n.relatedId) return `/orders/${n.relatedId}`
*/
export const getNotificationHref = (_n: Notification): string | null => {
    return null
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error
    const e = error as { message?: string } | undefined
    return e?.message || "Something went wrong"
}

export const timeAgo = (iso?: string): string => {
    if (!iso) return ""
    const date = new Date(iso)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const sameYear = date.getFullYear() === new Date().getFullYear()
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        ...(sameYear ? {} : { year: "numeric" }),
    })
}

interface TypeMeta {
    icon: LucideIcon
    color: string
}

// Icon + color for every notification type (matches NOTIFICATION_TYPES on the backend)
const TYPE_META: Record<string, TypeMeta> = {
    // Marketplace & Order
    ORDER_PLACED: { icon: ShoppingCart, color: "#3b82f6" },
    ORDER_CONFIRMED: { icon: CheckCircle2, color: "#0d9488" },
    ORDER_SHIPPED: { icon: Truck, color: "#8b5cf6" },
    ORDER_DELIVERED: { icon: PackageCheck, color: "#16a34a" },
    ORDER_CANCELLED: { icon: XCircle, color: "#ef4444" },
    PAYMENT_RECEIVED: { icon: Wallet, color: "#16a34a" },
    PAYMENT_REFUNDED: { icon: RotateCcw, color: "#f59e0b" },

    // Product & Inventory
    PRODUCT_APPROVED: { icon: BadgeCheck, color: "#16a34a" },
    PRODUCT_REJECTED: { icon: Ban, color: "#ef4444" },
    LOW_STOCK: { icon: AlertTriangle, color: "#f59e0b" },
    OUT_OF_STOCK: { icon: PackageX, color: "#ef4444" },
    PRODUCT_UPDATED: { icon: RefreshCw, color: "#0ea5e9" },

    // Report & Moderation
    REPORT_RECEIVED: { icon: FileWarning, color: "#f59e0b" },
    REPORT_RESOLVED: { icon: ShieldCheck, color: "#16a34a" },
    WARNING: { icon: AlertTriangle, color: "#f97316" },

    // Social & Communication
    LIKE: { icon: Heart, color: "#ec4899" },
    COMMENT: { icon: MessageCircle, color: "#6366f1" },

    // System Notifications
    ANNOUNCEMENT: { icon: Megaphone, color: "#8b5cf6" },
    SYSTEM_ALERT: { icon: ShieldAlert, color: "#dc2626" },
    PROMOTION: { icon: Tag, color: "#d946ef" },
    GENERAL: { icon: Bell, color: "#64748b" },
}
const DEFAULT_META: TypeMeta = { icon: Bell, color: "#64748b" }

export const getTypeMeta = (type?: string): TypeMeta => TYPE_META[type ?? ""] ?? DEFAULT_META

/* -------------------------------------------------------------------------- */
/*  Actions hook (used by both the menu and the page)                         */
/* -------------------------------------------------------------------------- */

export const useNotificationActions = () => {
    const dispatch = useDispatch<AppDispatch>()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [markingAll, setMarkingAll] = useState(false)

    const markRead = async (notificationId: string) => {
        try {
            await dispatch(readNotification({ notificationId })).unwrap()
        } catch (error) {
            toast.error(getErrorMessage(error))
        }
    }

    const markAllRead = async () => {
        setMarkingAll(true)
        try {
            await dispatch(readAllNotification(null)).unwrap()
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setMarkingAll(false)
        }
    }

    const remove = async (notificationId: string) => {
        setDeletingId(notificationId)
        try {
            await dispatch(deleteNotification({ notificationId })).unwrap()
            dispatch(deleteNotificationPrev(notificationId))
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setDeletingId(null)
        }
    }

    return { markRead, markAllRead, remove, deletingId, markingAll }
}

/* -------------------------------------------------------------------------- */
/*  UI                                                                        */
/* -------------------------------------------------------------------------- */

interface NotificationItemProps {
    notification: Notification
    onRead: (id: string) => void
    onDelete: (id: string) => void
    deleting?: boolean
    onNavigate?: () => void // e.g. close the dropdown
}

const clamp2: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
}

export const NotificationItem = ({ notification, onRead, onDelete, deleting, onNavigate }: NotificationItemProps) => {
    const { icon: Icon, color } = getTypeMeta(notification.type)
    const unread = !notification.isReaded
    const href = getNotificationHref(notification)

    const handleOpen = () => {
        if (unread) onRead(notification._id)
        onNavigate?.()
    }

    const body = (
        <>
            <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}1A`, color }}
            >
                <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p
                        className={`min-w-0 flex-1 text-sm ${
                            unread ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                        }`}
                        style={clamp2}
                    >
                        {notification.title}
                    </p>
                    {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#16a34a]" />}
                </div>
                <p className="mt-0.5 text-sm text-gray-600" style={clamp2}>
                    {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                    {notification.sender?.name ? `${notification.sender.name} · ` : ""}
                    {timeAgo(notification.createdAt)}
                </p>
            </div>
        </>
    )

    const bodyClass = "flex min-w-0 flex-1 items-start gap-3 text-left"

    return (
        <li
            className={`group relative flex items-start gap-1 px-4 py-3 transition-colors ${
                unread ? "bg-[#16a34a]/6 hover:bg-[#16a34a]/10" : "bg-white hover:bg-gray-50"
            } ${deleting ? "pointer-events-none opacity-50" : ""}`}
        >
            {href ? (
                <Link href={href} onClick={handleOpen} className={bodyClass}>
                    {body}
                </Link>
            ) : (
                <button type="button" onClick={handleOpen} className={bodyClass}>
                    {body}
                </button>
            )}

            {/* Hover actions (always visible on touch screens) */}
            <div className="flex shrink-0 flex-col gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                {unread && (
                    <button
                        type="button"
                        onClick={() => onRead(notification._id)}
                        title="Mark as read"
                        aria-label="Mark as read"
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-[#16a34a]/10 hover:text-[#16a34a]"
                    >
                        <Check size={16} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onDelete(notification._id)}
                    title="Delete"
                    aria-label="Delete notification"
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </li>
    )
}

export const NotificationSkeleton = ({ rows = 4 }: { rows?: number }) => (
    <ul className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
            <li key={i} className="flex animate-pulse items-start gap-3 px-4 py-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-2/5 rounded bg-gray-200" />
                    <div className="h-3 w-4/5 rounded bg-gray-100" />
                    <div className="h-2.5 w-1/4 rounded bg-gray-100" />
                </div>
            </li>
        ))}
    </ul>
)