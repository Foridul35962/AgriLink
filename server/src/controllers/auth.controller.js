import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { check, validationResult } from 'express-validator'
import Users from "../models/Users.model.js";
import bcrypt from 'bcryptjs'
import { generatePasswordResetMail, generateVerificationMail, sendBrevoMail } from "../config/mail.js";
import sendSMS from "../config/sms.js";
import redis from "../config/redis.js";
import ApiResponse from "../helpers/ApiResponse.js";
import jwt from 'jsonwebtoken'
import RequestUsers from "../models/RequestUsers.model.js";

export const registration = [
    check("name")
        .trim()
        .notEmpty()
        .withMessage("name is required"),
    check("email")
        .trim()
        .isEmail()
        .withMessage("email is invalid"),
    check("phoneNumber")
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

        const { name, email, phoneNumber, password, role, district } = req.body
        if (!["farmer", "aratdar", "retailer", "consumer"].includes(role)) {
            throw new ApiErrors(400, "invalid role")
        }

        const limitKey = `authLimit:${email}`

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

        const orConditions = []
        if (email) orConditions.push({ email })
        if (phoneNumber) orConditions.push({ phoneNumber })

        const duplicateUser = await Users.findOne({
            $or: orConditions
        })

        if (duplicateUser) {
            throw new ApiErrors(400, "user is already registered")
        }

        if (["farmer", "aratdar", "retailer"].includes(role)) {
            const existingRequest = await RequestUsers.findOne({
                $or: orConditions
            })

            if (existingRequest) {
                throw new ApiErrors(400, "user already requested. wait for admin response")
            }
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
        if (["farmer", "aratdar", "retailer"].includes(users.role)) {
            await RequestUsers.create({
                name: users.name,
                email: users.email,
                phoneNumber: users.phoneNumber,
                district: users.district,
                role: users.role,
                password: users.password
            })
        } else {
            await Users.create({
                name: users.name,
                email: users.email,
                phoneNumber: users.phoneNumber,
                district: users.district,
                role: users.role,
                password: users.password
            })
        }
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

export const login = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('password is not matched')
        .matches(/[a-zA-Z]/)
        .withMessage('password is not matched')
        .matches(/[0-9]/)
        .withMessage('password is not matched'),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array())
        }

        const { email, password } = req.body
        if (!email || !password) {
            throw new ApiErrors(400, "all field are required")
        }

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const user = await Users.findOne({
            email: email
        })

        if (!user) {
            throw new ApiErrors(404, "user is not registered")
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            throw new ApiErrors(400, "password is not matched")
        }

        user.password = undefined

        const token = await jwt.sign({
            userId: user._id,
            role: user.role
        },
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.TOKEN_EXPIRY }
        )

        const tokenOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 10 * 24 * 60 * 60 * 1000
        }

        return res
            .status(200)
            .cookie('token', token, tokenOption)
            .json(
                new ApiResponse(200, user, "user logged in successfully")
            )
    })
]

export const logOut = AsyncHandler(async (req, res) => {
    const tokenOption = {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 10 * 24 * 60 * 60 * 1000
    }

    return res
        .status(200)
        .clearCookie('token', tokenOption)
        .json(
            new ApiResponse(200, {}, 'user logout successfully')
        )
})

export const forgetPass = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),

    AsyncHandler(async (req, res) => {
        const { email } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'invalid value', error.array())
        }

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)
        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }


        const user = await Users.findOne({ email }).lean()

        if (!user) {
            throw new ApiErrors(404, 'user is not registered')
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        const { subject, html } = generatePasswordResetMail(otp)

        try {
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(500, 'otp send failed')
        }

        const coolDownKey = `coolDownMail:${email}`
        await redis.set(coolDownKey, "1", "EX", 60)

        const resetRedisKey = `resetPass:${email}`

        await redis.set(resetRedisKey,
            JSON.stringify({
                otp: otp
            }),
            "EX",
            300
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'otp send successfully')
            )
    })
]

export const verifyResetPass = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('otp')
        .trim()
        .isNumeric()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be a 6 digit number'),

    AsyncHandler(async (req, res) => {
        const { email, otp } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'invalid value', error.array())
        }

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)
        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const resetRedisKey = `resetPass:${email}`

        const redisUser = await redis.get(resetRedisKey)

        if (!redisUser) {
            throw new ApiErrors(410, 'otp is expired')
        }

        const user = JSON.parse(redisUser)

        if (otp !== user.otp) {
            throw new ApiErrors(400, 'otp is not matched')
        }

        await redis.set(resetRedisKey,
            JSON.stringify({
                verified: true
            }),
            "EX", 300
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'otp is verified')
            )
    })
]

export const resetPass = [
    check('email')
        .trim()
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('password is not matched')
        .matches(/[a-zA-Z]/)
        .withMessage('password is not matched')
        .matches(/[0-9]/)
        .withMessage('password is not matched'),

    AsyncHandler(async (req, res) => {
        const { email, password } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'invalid value', error.array())
        }

        const resetRedisKey = `resetPass:${email}`

        const redisValidity = await redis.get(resetRedisKey)

        if (!redisValidity) {
            throw new ApiErrors(410, 'time expired, try again')
        }

        const validation = JSON.parse(redisValidity)
        if (!validation.verified) {
            throw new ApiErrors(401, 'email is not verified')
        }

        const hashPassword = await bcrypt.hash(password, 12)

        const user = await Users.findOneAndUpdate({ email },
            { password: hashPassword }
        )

        if (!user) {
            throw new ApiErrors(404, 'user not found and reset password failed')
        }

        const limitKey = `authLimit:${email}`
        await redis.del(limitKey)
        await redis.del(resetRedisKey)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'password reset successfully')
            )
    })
]

export const resendOtp = [
    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('topic')
        .trim()
        .notEmpty()
        .withMessage('topic is required'),

    AsyncHandler(async (req, res) => {
        const { email, topic } = req.body

        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, 'invalid value', error.array())
        }

        const limitKey = `authLimit:${email}`

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
            throw new ApiErrors(429, `please wait ${ttl}s before resending OTP`)
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        let mailData;

        if (topic === 'registration') {
            mailData = generateVerificationMail(otp)

            const redisKey = `userRegistration:${email}`
            const redisValue = await redis.get(redisKey)
            if (!redisValue) {
                throw new ApiErrors(400, 'value is expired, try again')
            }

            const users = JSON.parse(redisValue)

            await redis.set(redisKey, JSON.stringify({
                name: users.name,
                email: users.email,
                phoneNumber: users.phoneNumber,
                district: users.district,
                role: users.role,
                password: users.password,
                otp: otp,
                verify: false
            }), "EX", 300)
        }
        else if (topic === 'forgetPass') {
            mailData = generatePasswordResetMail(otp);

            const resetRedisKey = `resetPass:${email}`

            await redis.set(resetRedisKey,
                JSON.stringify({
                    otp: otp,
                    verify: false
                }),
                "EX",
                300
            )
        }

        const { subject, html } = mailData;

        try {
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(400, 'resend otp send failed')
        }

        await redis.set(coolDownKey, "1", "EX", 60)

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, 'otp send successfully')
            )
    })
]

export const fetchUser = AsyncHandler(async (req, res) => {
    const user = req.user

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, 'user fetch successfully')
        )
})