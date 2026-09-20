"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence, motion } from "framer-motion"
import { Bell, BellOff, CheckCheck, Loader2, ArrowRight } from "lucide-react"
import { toast } from "react-toastify"

import { getAllNotification, getUnReadNotificationCount } from "@/store/slice/notificationSlice"
import { AppDispatch, RootState } from "@/store/store"
import {
    NOTIFICATIONS_ROUTE,
    NotificationItem,
    NotificationSkeleton,
    getErrorMessage,
    useNotificationActions
} from "@/components/notification/notificationShared"


const NotificationMenu = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { allNotificationData, notificationLoading, unreadNotificationCount } = useSelector(
        (state: RootState) => state.notification
    )
    const { markRead, markAllRead, remove, deletingId, markingAll } = useNotificationActions()

    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Menu only shows the first page of notifications
    const pageSize = allNotificationData.pagination.limit || 10
    const items = allNotificationData.notifications.slice(0, pageSize)

    // Initial load: unread badge count + page 1 (if nothing is loaded yet)
    useEffect(() => {
        const init = async () => {
            try {
                await dispatch(getUnReadNotificationCount(null)).unwrap()
                if (allNotificationData.notifications.length === 0) {
                    await dispatch(getAllNotification({ page: 1 })).unwrap()
                }
            } catch (error) {
                toast.error(getErrorMessage(error))
            }
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Refresh the badge every time the menu is opened
    useEffect(() => {
        if (open) dispatch(getUnReadNotificationCount(null))
    }, [open, dispatch])

    // Close on outside click / Escape
    useEffect(() => {
        if (!open) return
        const onClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    const badge = unreadNotificationCount > 99 ? "99+" : String(unreadNotificationCount)

    return (
        <div ref={wrapperRef} className="relative">
            {/* Bell button */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Notifications"
                aria-expanded={open}
                className={`relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition hover:bg-gray-100 ${open ? "bg-gray-100" : ""
                    }`}
            >
                <Bell size={20} />
                {unreadNotificationCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                        {badge}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-100"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                                {unreadNotificationCount > 0 && (
                                    <span className="rounded-full bg-[#16a34a]/10 px-2 py-0.5 text-xs font-medium text-[#16a34a]">
                                        {unreadNotificationCount} new
                                    </span>
                                )}
                            </div>
                            {unreadNotificationCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllRead}
                                    disabled={markingAll}
                                    className="flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline disabled:opacity-60"
                                >
                                    {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-105 overflow-y-auto">
                            {notificationLoading && items.length === 0 ? (
                                <NotificationSkeleton rows={4} />
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                        <BellOff size={22} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">No notifications yet</p>
                                    <p className="mt-1 text-xs text-gray-500">We&apos;ll let you know when something happens.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {items.map((notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onRead={markRead}
                                            onDelete={remove}
                                            deleting={deletingId === notification._id}
                                            onNavigate={() => setOpen(false)}
                                        />
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <Link
                            href={NOTIFICATIONS_ROUTE}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-center gap-1.5 border-t border-gray-100 py-3 text-sm font-medium text-[#16a34a] transition hover:bg-gray-50"
                        >
                            View all notifications
                            <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NotificationMenu