import express from 'express'
import * as controller from '../controllers/admin.controller.js'
import protect from '../middlewares/protect.js'
import isAdmin from '../middlewares/isAdmin.js'

const adminRouter = express.Router()

adminRouter.get('/user-request/:role', protect, isAdmin, controller.getUsersRequest)
adminRouter.post('/user-request-accept', protect, isAdmin, controller.acceptAddRequest)
adminRouter.post('/user-request-reject', protect, isAdmin, controller.rejectAddRequest)
adminRouter.delete("/remove-member", protect, isAdmin, controller.removeMember)

export default adminRouter