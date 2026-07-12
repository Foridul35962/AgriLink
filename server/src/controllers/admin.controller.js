import { generateApprovalMail, generateRejectionMail, sendBrevoMail } from "../config/mail.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import RequestUsers from "../models/RequestUsers.model.js";
import Users from "../models/Users.model.js";

export const getUsersRequest = AsyncHandler(async (req, res) => {
    const { role } = req.params
    
    if (!["farmer", "aratdar", "retailer"].includes(role)) {
        throw new ApiErrors(400, "invalid role")
    }
    
    const page = Number(req.query.page) || 1;
    
    const limit = 15;
    const skip = (page - 1) * limit;

    const users = await RequestUsers.find({ role })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("name email phoneNumber district")

    return res
        .status(200)
        .json(
            new ApiResponse(200, users, "requested user fetch successfully")
        )
})

export const acceptAddRequest = AsyncHandler(async (req, res) => {
    const { userId } = req.body
    if (!userId) {
        throw new ApiErrors(400, "user id is required")
    }

    const reqUser = await RequestUsers.findById(userId)
    if (!reqUser) {
        throw new ApiErrors(404, "user is not requested")
    }

    const user = await Users.create({
        name: reqUser.name,
        email: reqUser.email,
        phoneNumber: reqUser.phoneNumber,
        role: reqUser.role,
        password: reqUser.password,
        district: reqUser.district
    })

    if (!user) {
        throw new ApiErrors(500, "user created failed")
    }

    await reqUser.deleteOne()

    const { html, subject } = generateApprovalMail()

    sendBrevoMail(user.email, subject, html)
        .catch((error) => {
            console.error("Mail send failed:", error.message);
        });

    return res
        .status(200)
        .json(
            new ApiResponse(200, userId, "user added successfully")
        )
})

export const rejectAddRequest = AsyncHandler(async (req, res) => {
    const { userId } = req.body
    if (!userId) {
        throw new ApiErrors(400, "user id is required")
    }

    const user = await RequestUsers.findByIdAndDelete(userId)
    if (!user) {
        throw new ApiErrors(404, "user is not found")
    }

    const { subject, html } = generateRejectionMail()

    sendBrevoMail(user.email, subject, html)
        .catch((error) => {
            console.error("Mail send failed:", error.message);
        });

    return res
        .status(200)
        .json(
            new ApiResponse(200, userId, "user rejected successfully")
        )
})