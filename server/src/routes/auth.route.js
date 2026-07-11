import express from 'express'
import * as controller from '../controllers/auth.controller.js'

const authRouter = express.Router()

authRouter.post('/registration', controller.registration)
authRouter.post("/verify-regi", controller.verifyRegistration)

export default authRouter