import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { check, validationResult } from 'express-validator'
import Users from "../models/Users.model.js";
import bcrypt from 'bcryptjs'
import { generateVerificationMail, sendBrevoMail } from "../config/mail.js";
import sendSMS from "../config/sms.js";
import redis from "../config/redis.js";
import ApiResponse from "../helpers/ApiResponse.js";

export const registration = [
    check("name")
        .trim()
        .notEmpty()
        .withMessage("name is required"),
    check("userName")
        .trim()
        .notEmpty()
        .withMessage("user name is required"),
    check("email")
        .optional({ checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage("email is invalid"),
    check("phoneNumber")
        .optional({ checkFalsy: true })
        .trim()
        .isMobilePhone("bn-BD")
        .withMessage("phone number is invalid"),
    check("password")
        .notEmpty()
        .withMessage("password is required")
        .trim()
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/[a-zA-Z]/)
        .withMessage('password must contain a letter')
        .matches(/[0-9]/)
        .withMessage('password must contain a number'),
    check("district")
        .notEmpty()
        .withMessage("district is required"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }

        const { name, userName, email, phoneNumber, password, role, district } = req.body
        if (!["farmer", "aratdar", "retailer", "consumer"].includes(role)) {
            throw new ApiErrors(400, "invalid role")
        }

        let limitKey
        if (email) {
            limitKey = `authLimit:${email}`
        } else {
            limitKey = `authLimit:${phoneNumber}`
        }

        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const coolDownKey = `coolDownMail:${email}`

        const ttl = await redis.ttl(coolDownKey)

        if (ttl > 0) {
            throw new ApiErrors(429, `please wait ${ttl}s because you try too many time`)
        }

        const orConditions = [{ userName }]
        if (email) orConditions.push({ email })
        if (phoneNumber) orConditions.push({ phoneNumber })

        const duplicateUser = await Users.findOne({
            $or: orConditions
        })

        if (duplicateUser) {
            throw new ApiErrors(400, "user is already registered")
        }

        const hashedPass = await bcrypt.hash(password, 12)

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        if (email) {
            try {
                const { subject, html } = generateVerificationMail(otp)
                await sendBrevoMail(email, subject, html)
            } catch (error) {
                throw new ApiErrors(500, 'email send failed')
            }
        } else if (phoneNumber) {
            const message = `Your AgriLink verification code is ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;

            try {
                await sendSMS({
                    phoneNumber,
                    message
                });
            } catch (error) {
                throw new ApiErrors(500, "Otp send failed. try with email")
            }
        }

        await redis.set(coolDownKey, "1", "EX", 60)

        const redisKey = `userRegistration:${email}`

        await redis.set(redisKey,
            JSON.stringify({
                name: name,
                userName: userName,
                role: role,
                email: email,
                phoneNumber: phoneNumber,
                password: hashedPass,
                district: district,
                otp: otp
            }),
            "EX", 300
        )

        return res
            .status(202)
            .json(
                new ApiResponse(202, {}, 'user registration successfully')
            )
    })
]

export const verifyRegistration = AsyncHandler(async (req, res) => {
    const { otp, email } = req.body
    if (!email) {
        throw new ApiErrors(400, "email is required")
    }

    if (!otp || otp.length !== 6) {
        throw new ApiErrors(400, "otp is not matched")
    }

    const limitKey = `authLimit:${email}`

    const count = await redis.incr(limitKey)

    if (count === 1) {
        await redis.expire(limitKey, 1800)
    }

    if (count > 10) {
        throw new ApiErrors(429, 'too many request')
    }

    const redisKey = `userRegistration:${email}`

    const redisUser = await redis.get(redisKey)
    if (!redisUser) {
        throw new ApiErrors(400, "otp is expired")
    }

    const users = JSON.parse(redisUser)

    if (otp !== users.otp) {
        throw new ApiErrors(400, "otp is not matched")
    }

    try {
        await Users.create({
            name: users.name,
            userName: users.userName,
            email: users.email,
            phoneNumber: users.phoneNumber,
            district: users.district,
            role: users.role,
            password: users.password
        })
    } catch (error) {
        throw new ApiErrors(500, "user registration failed")
    }

    await redis.del(redisKey)

    return res
        .status(201)
        .json(
            new ApiResponse(201, {}, "user verified successfully")
        )

})