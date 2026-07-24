import mongoose from "mongoose";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Reports from "../models/Reports.model.js";
import redis from "../config/redis.js";
import { check, validationResult } from 'express-validator'
import { generateWarningMail, sendBrevoMail } from "../config/mail.js";
import Notification from "../models/Notification.model.js";
import { NOTIFICATION_TYPES } from "../constants/notification.types.js";

export const createReports = [
    check('reportedUserId')
        .notEmpty()
        .withMessage("reported user id is required")
        .isMongoId()
        .withMessage("invalid reported id"),
    check("topic")
        .notEmpty()
        .withMessage("topic is required")
        .isLength({ min: 10, max: 50 })
        .withMessage("topic must be between 10 and 50 characters"),
    check("description")
        .notEmpty()
        .withMessage("description is required")
        .isLength({ min: 50, max: 300 })
        .withMessage("description must be between 50 and 300 characters"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }
        const userId = req.user._id
        const { reportedUserId, topic, description } = req.body

        const exestingReport = await Reports.findOne({
            reporterId: userId,
            reportedUserId: reportedUserId
        })

        if (exestingReport) {
            throw new ApiErrors(400, "report already created")
        }

        const report = await Reports.create({
            reporterId: userId,
            reportedUserId: reportedUserId,
            topic: topic,
            description: description
        })

        if (!report) {
            throw new ApiErrors(400, "report created failed")
        }

        Notification.create({
            sender: null,
            recipient: userId,
            type: NOTIFICATION_TYPES.REPORT_RECEIVED,
            title: "Report Submitted Successfully",
            message: `Your report regarding "${topic}" has been received. Our support team will review it shortly.`,
            relatedId: report._id
        })
            .then((notification) => {
                // TODO: Socket need
            })

        return res
            .status(201)
            .json(
                new ApiResponse(201, report, "report created successfully")
            )
    })
]

export const viewAllReports = AsyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);

    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = { isReviewed: false };

    const [reports, totalReports] = await Promise.all([
        Reports.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("topic"),
        Reports.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                reports,
                pagination: {
                    page,
                    limit,
                    totalReports,
                    totalPages: Math.ceil(totalReports / limit),
                    hasNextPage: page < Math.ceil(totalReports / limit),
                    hasPrevPage: page > 1,
                },
            },
            "all reports fetched successfully"
        )
    );
});

export const viewReportById = AsyncHandler(async (req, res) => {
    const { reportId } = req.params;

    if (!reportId || !mongoose.isValidObjectId(reportId)) {
        throw new ApiErrors(400, "Invalid or missing report id");
    }

    const redisKey = `report:${reportId}`;
    let responseData;

    const redisReport = await redis.get(redisKey);
    if (redisReport) {
        responseData = JSON.parse(redisReport);
    } else {
        const mainReport = await Reports.findById(reportId)
            .populate([
                { path: "reporterId", select: "name email phoneNumber" },
                { path: "reportedUserId", select: "name email phoneNumber" }
            ])
            .lean();

        if (!mainReport) {
            throw new ApiErrors(404, "Report not found");
        }

        const [reporterHistory, reportedUserHistory] = await Promise.all([
            Reports.find({ reporterId: mainReport.reporterId._id, _id: { $ne: reportId } })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("topic isReviewed createdAt")
                .lean(),

            Reports.find({ reportedUserId: mainReport.reportedUserId._id, _id: { $ne: reportId } })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("topic isReviewed createdAt")
                .lean()
        ]);

        responseData = {
            report: mainReport,
            reporterHistory,
            reportedUserHistory
        };

        await redis.set(redisKey, JSON.stringify(responseData), "EX", 300);
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, responseData, "Report details and history fetched successfully")
        );
});

export const makeWarning = AsyncHandler(async (req, res) => {
    const { reportId } = req.body
    if (!reportId) {
        throw new ApiErrors(400, "report id is required")
    }

    if (!mongoose.isValidObjectId(reportId)) {
        throw new ApiErrors(400, "invalid report id")
    }

    const report = await Reports.findById(reportId)
        .populate({ path: "reportedUserId", select: "email" })
        .select("reportedUserId topic isReviewed")

    if (!report) {
        throw new ApiErrors(404, "report is not found")
    }

    if (report.isReviewed) {
        throw new ApiErrors(400, "report is reviewed")
    }

    report.isReviewed = true

    await report.save()

    const { subject, html } = generateWarningMail(report.topic)

    sendBrevoMail(report.reportedUserId.email, subject, html)
        .catch(() => {
            console.error("message send failed")
        })

    Notification.create({
        sender: null,
        recipient: report.reportedUserId._id,
        type: NOTIFICATION_TYPES.WARNING,
        title: "Account Warning Issued",
        message: `Your account has received a warning due to community guidelines violation related to: "${report.topic}". Further violations may lead to account suspension.`,
        relatedId: report._id
    })
        .then((notification) => {
            // TODO: Socket need
        })

    return res
        .status(200)
        .json(
            new ApiResponse(200, reportId, "warning send successfully")
        )
})

export const reoprtViewDone = AsyncHandler(async (req, res) => {
    const { reportId } = req.body
    if (!reportId) {
        throw new ApiErrors(400, "report id is required")
    }

    if (!mongoose.isValidObjectId(reportId)) {
        throw new ApiErrors(400, "invalid report id")
    }

    const report = await Reports.findByIdAndUpdate(reportId, {
        isReviewed: true
    })

    if (!report) {
        throw new ApiErrors(404, "report is not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, reportId, "report view done")
        )
})