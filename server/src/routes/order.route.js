import express from 'express'
import * as controller from '../controllers/order.controller.js'
import isFarmer from '../middlewares/isFarmer.js'
import isAratdar from '../middlewares/isAratdar.js'
import protect from '../middlewares/protect.js'
import isRetailer from '../middlewares/isRetailer.js'

const orderRouter = express.Router()

orderRouter.get("/farmer-receive", protect, isFarmer, controller.getFarmerReceiveOrder)
orderRouter.get("/farmer-receive-details/:orderId", protect, isFarmer, controller.getFarmerReceiveOrderDetails)
orderRouter.patch("/farmer-change-status/:orderId", protect, isFarmer, controller.changeFarmerOrderStatus)
orderRouter.get("/aratdar-placed", protect, isAratdar, controller.getAratdarPlacedOrder)
orderRouter.get("/farmer-placed-details/:orderId", protect, isAratdar, controller.getAratdarPlacedOrderDetails)
orderRouter.get("/aratdar-received", protect, isAratdar, controller.getAratdarReceivedOrder)
orderRouter.get("/aratdar-received-details/:orderId", protect, isAratdar, controller.getAratdarReceiveOrderDetails)
orderRouter.patch("/aratdar-change-status/:orderId", protect, isAratdar, controller.changeAratdarOrderStatus)
orderRouter.get("/retailer-placed", protect, isRetailer, controller.getRetailerPlacedOrder)
orderRouter.get("/retailer-placed-details/:orderId", protect, isRetailer, controller.getRetailerPlacedOrderDetails)
orderRouter.patch("/cancel", protect, isRetailer, controller.cancelReailerOrder)

export default orderRouter