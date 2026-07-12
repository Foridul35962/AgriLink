import mongoose from "mongoose";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Reports from "../models/Reports.model.js";
import redis from "../config/redis.js";
import { check, validationResult } from 'express-validator'

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

        return res
            .status(201)
            .json(
                new ApiResponse(201, report, "report created successfully")
            )
    })
]

export const viewAllReports = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;

    const limit = 20;
    const skip = (page - 1) * limit;

    const reports = await Reports.find({ isReviewed: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("topic")

    return res
        .status(200)
        .json(
            new ApiResponse(200, reports, "all report fetch successfully")
        )
})

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