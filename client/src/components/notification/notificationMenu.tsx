"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence, motion } from "framer-motion"
import { Bell, BellOff, CheckCheck, Loader2, ArrowRight, Volume2, VolumeX } from "lucide-react"
import { toast } from "react-toastify"
import {
    getAllNotification,
    getUnReadNotificationCount,
    updateNotification,
} from "@/store/slice/notificationSlice"
import { AppDispatch, RootState } from "@/store/store"
import type { Notification } from "@/types/notificationTypes"
import {
    NOTIFICATIONS_ROUTE,
    NotificationItem,
    NotificationSkeleton,
    getErrorMessage,
    useNotificationActions,
} from "./notificationShared"
import socket from "@/socket"
import {
    getSoundEnabled,
    playNotificationSound,
    setSoundEnabled,
    setupSoundUnlock
} from "@/components/notification/notificationSound"

const NotificationMenu = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { allNotificationData, notificationLoading, unreadNotificationCount } = useSelector(
        (state: RootState) => state.notification
    )
    const { markRead, markAllRead, remove, deletingId, markingAll } = useNotificationActions()

    const [open, setOpen] = useState(false)
    const [soundOn, setSoundOn] = useState(true)
    const [ringKey, setRingKey] = useState(0)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const soundOnRef = useRef(true)

    // Menu only shows the first page of notifications
    const pageSize = allNotificationData.pagination.limit || 10
    const items = allNotificationData.notifications.slice(0, pageSize)

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

    // Sound preference + unlock audio on the first user interaction
    useEffect(() => {
        const enabled = getSoundEnabled()
        setSoundOn(enabled)
        soundOnRef.current = enabled
        return setupSoundUnlock()
    }, [])

    // Real-time: new notification from the server.
    // This lives in the navbar, so it works on EVERY page (including the notification page).
    useEffect(() => {
        const handleUpdateNotification = ({ notification }: { notification: Notification }) => {
            dispatch(updateNotification({ notification }))
            setRingKey((k) => k + 1)
            if (soundOnRef.current) playNotificationSound()
        }
        socket.on("updateNotification", handleUpdateNotification)

        return () => {
            socket.off("updateNotification", handleUpdateNotification)
        }
    }, [dispatch])

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

    const toggleSound = () => {
        const next = !soundOn
        setSoundOn(next)
        soundOnRef.current = next
        setSoundEnabled(next)
        if (next) playNotificationSound(true)
    }

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
                {/* Bell shakes on every new notification */}
                <motion.span
                    key={ringKey}
                    className="inline-flex"
                    style={{ transformOrigin: "50% 0%" }}
                    animate={ringKey > 0 ? { rotate: [0, -18, 16, -12, 10, -6, 3, 0] } : undefined}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <Bell size={20} />
                </motion.span>

                {/* Unread badge pops every time the count changes */}
                {unreadNotificationCount > 0 && (
                    <motion.span
                        key={unreadNotificationCount}
                        initial={{ scale: 0.4 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
                    >
                        {badge}
                    </motion.span>
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
                        className="fixed inset-x-3 top-16 z-50 flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-[85vh] sm:w-100"
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                                {unreadNotificationCount > 0 && (
                                    <span className="rounded-full bg-[#16a34a]/10 px-2 py-0.5 text-xs font-medium text-[#16a34a]">
                                        {unreadNotificationCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadNotificationCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={markAllRead}
                                        disabled={markingAll}
                                        className="flex items-center gap-1 text-xs font-medium text-[#16a34a] hover:underline disabled:opacity-60"
                                    >
                                        {markingAll ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <CheckCheck size={14} />
                                        )}
                                        Mark all as read
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={toggleSound}
                                    title={soundOn ? "Mute notification sound" : "Turn on notification sound"}
                                    aria-label={soundOn ? "Mute notification sound" : "Turn on notification sound"}
                                    className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                >
                                    {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto sm:max-h-95">
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
                            className="flex shrink-0 items-center justify-center gap-1.5 border-t border-gray-100 py-3 text-sm font-medium text-[#16a34a] transition hover:bg-gray-50"
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