import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import Notification from "../models/Notification.model.js";
import mongoose from "mongoose";

export const getAllNotification = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const limit = 15;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [notifications, totalNotifications] = await Promise.all([
        Notification.find({
            recipient: userId
        })
            .populate({
                path: "sender",
                select: "name"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),

        Notification.countDocuments({
            recipient: userId
        })
    ]);

    const totalPages = Math.ceil(totalNotifications / limit);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    notifications,
                    pagination: {
                        currentPage: page,
                        totalPages,
                        totalNotifications,
                        limit,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                },
                "Notifications fetched successfully"
            )
        );
});

export const readNotification = AsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    if (!notificationId) {
        throw new ApiErrors(400, "notification id is required");
    }

    if (!mongoose.isValidObjectId(notificationId)) {
        throw new ApiErrors(400, "Invalid notification id");
    }

    const notification = await Notification.findOneAndUpdate(
        {
            _id: notificationId,
            recipient: userId,
            isReaded: false
        },
        {
            isReaded: true
        },
        {
            new: true
        }
    );

    if (!notification) {
        throw new ApiErrors(404, "Notification is not found or already read");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notificationId,
                "Notification read successfully"
            )
        );
});

export const readAllNotification = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await Notification.updateMany(
        {
            recipient: userId,
            isReaded: false
        },
        {
            $set: {
                isReaded: true
            }
        }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, {}, "All notifications marked as read"
            )
        );
});

export const getUnreadNotificationCount = AsyncHandler(async (req, res) => {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isReaded: false
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, unreadCount, "Unread notification count fetched successfully"
            )
        );
});

export const deleteNotification = AsyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    if (!notificationId) {
        throw new ApiErrors(400, "notification id is required");
    }

    if (!mongoose.isValidObjectId(notificationId)) {
        throw new ApiErrors(400, "Invalid notification id");
    }

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
    });

    if (!notification) {
        throw new ApiErrors(404, "Notification not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notification._id,
                "Notification deleted successfully"
            )
        );
});