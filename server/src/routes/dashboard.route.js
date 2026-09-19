import express from "express";
import * as controller from "../controllers/dashboard.controller.js"
import protect from "../middlewares/protect.js"
import isRetailer from "../middlewares/isRetailer.js"
import isFarmer from "../middlewares/isFarmer.js"
import isAratdar from "../middlewares/isAratdar.js"

const dashboardRouter = express.Router()

dashboardRouter.get("/farmer", protect, isFarmer, controller.farmerDashboard)
dashboardRouter.get("/aratdar", protect, isAratdar, controller.aratdarDashboard)
dashboardRouter.get("/retailer", protect, isRetailer, controller.retailerDashboard)

export default dashboardRouter