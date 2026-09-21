"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BellOff, CheckCheck, Loader2, RotateCcw } from "lucide-react"
import { toast } from "react-toastify"

import { getAllNotification, getUnReadNotificationCount, updateNotification } from "@/store/slice/notificationSlice"
import { AppDispatch, RootState } from "@/store/store"
import type { Notification } from "@/types/notificationTypes"
import { getErrorMessage, NotificationItem, NotificationSkeleton, useNotificationActions } from "@/components/notification/notificationShared"
import { getSoundEnabled, playNotificationSound, setupSoundUnlock } from "@/components/notification/notificationSound"
import socket from "@/socket"

type Filter = "all" | "unread"
type GroupName = "Today" | "Yesterday" | "Earlier"
const GROUP_ORDER: GroupName[] = ["Today", "Yesterday", "Earlier"]

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

const groupOf = (iso?: string): GroupName => {
    if (!iso) return "Earlier"
    const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86400000)
    if (dayDiff <= 0) return "Today"
    if (dayDiff === 1) return "Yesterday"
    return "Earlier"
}

const NotificationsPage = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { allNotificationData, notificationLoading, unreadNotificationCount } = useSelector(
        (state: RootState) => state.notification
    )
    const { notifications, pagination } = allNotificationData
    const { markRead, markAllRead, remove, deletingId, markingAll } = useNotificationActions()

    const [filter, setFilter] = useState<Filter>("all")
    const [initialized, setInitialized] = useState(false)
    const [loadFailed, setLoadFailed] = useState(false)
    const soundOnRef = useRef(true)

    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const fetchingRef = useRef(false)

    const loadPage = useCallback(
        async (page: number) => {
            if (fetchingRef.current) return
            fetchingRef.current = true
            setLoadFailed(false)
            try {
                await dispatch(getAllNotification({ page })).unwrap()
            } catch (error) {
                setLoadFailed(true)
                toast.error(getErrorMessage(error))
            } finally {
                fetchingRef.current = false
            }
        },
        [dispatch]
    )

    // First load
    useEffect(() => {
        const init = async () => {
            dispatch(getUnReadNotificationCount(null))
            if (notifications.length === 0) {
                await loadPage(1)
            }
            setInitialized(true)
        }
        init()
    }, [])

    useEffect(() => {
        const el = sentinelRef.current
        if (!el || !initialized || !pagination.hasNextPage || notificationLoading || loadFailed) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadPage(pagination.currentPage + 1)
            },
            { rootMargin: "200px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [
        initialized,
        pagination.hasNextPage,
        pagination.currentPage,
        notifications.length,
        notificationLoading,
        loadFailed,
        filter,
        loadPage,
    ])

    useEffect(() => {
        const enabled = getSoundEnabled()
        soundOnRef.current = enabled
        return setupSoundUnlock()
    }, [])

    useEffect(() => {
        const handleUpdateNotification = ({ notification }: { notification: Notification }) => {
            dispatch(updateNotification({ notification }))
            if (soundOnRef.current) playNotificationSound()
        }
        socket.on("updateNotification", handleUpdateNotification)

        return () => {
            socket.off("updateNotification", handleUpdateNotification)
        }
    }, [dispatch])

    const visible = filter === "unread" ? notifications.filter((n) => !n.isReaded) : notifications

    const groups = GROUP_ORDER.map((name) => ({
        name,
        items: visible.filter((n) => groupOf(n.createdAt) === name),
    })).filter((group) => group.items.length > 0)

    const loadingMore = notificationLoading && notifications.length > 0

    return (
        <div className="min-h-screen bg-[#F3F9F5] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {unreadNotificationCount > 0
                                ? `You have ${unreadNotificationCount} unread notification${unreadNotificationCount > 1 ? "s" : ""}`
                                : "You're all caught up"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={markAllRead}
                        disabled={markingAll || unreadNotificationCount === 0}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#16a34a] shadow-sm ring-1 ring-black/5 transition hover:ring-[#16a34a]/40 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:ring-black/5"
                    >
                        {markingAll ? <Loader2 size={16} className="animate-spin" /> : <CheckCheck size={16} />}
                        Mark all as read
                    </button>
                </div>

                {/* Filter tabs */}
                <div className="inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/5">
                    {(
                        [
                            { key: "all", label: "All", count: pagination.totalNotifications },
                            { key: "unread", label: "Unread", count: unreadNotificationCount },
                        ] as { key: Filter; label: string; count: number }[]
                    ).map((tab) => {
                        const active = filter === tab.key
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setFilter(tab.key)}
                                className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition ${active ? "bg-[#16a34a] text-white" : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                {tab.label}
                                <span
                                    className={`rounded-full px-1.5 text-xs ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                {!initialized ? (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                        <NotificationSkeleton rows={6} />
                    </div>
                ) : groups.length === 0 && !pagination.hasNextPage ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-black/5">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#16a34a]/10 text-[#16a34a]">
                            <BellOff size={26} />
                        </div>
                        <p className="text-base font-semibold text-gray-900">
                            {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            {filter === "unread"
                                ? "You've read everything. Nice!"
                                : "We'll let you know when something happens."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groups.map((group) => (
                            <section key={group.name}>
                                <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {group.name}
                                </h2>
                                <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                                    {group.items.map((notification: Notification) => (
                                        <NotificationItem
                                            key={notification._id}
                                            notification={notification}
                                            onRead={markRead}
                                            onDelete={remove}
                                            deleting={deletingId === notification._id}
                                        />
                                    ))}
                                </ul>
                            </section>
                        ))}

                        {/* Bottom status + scroll sentinel */}
                        {pagination.hasNextPage && <div ref={sentinelRef} className="h-1" />}

                        {loadingMore && (
                            <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-600">
                                <Loader2 size={18} className="animate-spin text-[#16a34a]" />
                                Loading more...
                            </div>
                        )}

                        {loadFailed && (
                            <div className="flex flex-col items-center gap-2 py-4">
                                <p className="text-sm text-gray-600">Couldn&apos;t load more notifications.</p>
                                <button
                                    type="button"
                                    onClick={() => loadPage(pagination.currentPage + 1)}
                                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#16a34a] shadow-sm ring-1 ring-black/5 hover:ring-[#16a34a]/40"
                                >
                                    <RotateCcw size={14} />
                                    Try again
                                </button>
                            </div>
                        )}

                        {!pagination.hasNextPage && notifications.length > 0 && (
                            <p className="py-4 text-center text-sm text-gray-500">You&apos;ve reached the end</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationsPage