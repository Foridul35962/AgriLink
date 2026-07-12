import express from 'express'
import * as controller from '../controllers/auth.controller.js'
import protect from '../middlewares/protect.js'

const authRouter = express.Router()

authRouter.post('/registration', controller.registration)
authRouter.post("/verify-regi", controller.verifyRegistration)
authRouter.post("/login", controller.login)
authRouter.get("/logout", controller.logOut)
authRouter.post("/forget-pass", controller.forgetPass)
authRouter.post("/verify-forget-pass", controller.verifyResetPass)
authRouter.patch("/reset-pass", controller.resetPass)
authRouter.post("/resend-otp", controller.resendOtp)
authRouter.get("/me", protect, controller.fetchUser)

export default authRouter