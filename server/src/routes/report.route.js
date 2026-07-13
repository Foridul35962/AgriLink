import express from 'express'
import * as controller from '../controllers/report.controller.js'
import protect from '../middlewares/protect.js'
import isAdmin from '../middlewares/isAdmin.js'

const reportRouter = express.Router()

reportRouter.post("/create", protect, controller.createReports)
reportRouter.get("/all-reports", protect, isAdmin, controller.viewAllReports)
reportRouter.get("/report/:reportId", protect, isAdmin, controller.viewReportById)
reportRouter.patch("/warning", protect, isAdmin, controller.makeWarning)
reportRouter.post("/view-done", protect, isAdmin, controller.reoprtViewDone)

export default reportRouter