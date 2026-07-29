import express from 'express'
import * as controller from '../controllers/order.controller.js'
import isFarmer from '../middlewares/isFarmer.js'
import isAratdar from '../middlewares/isAratdar.js'

const orderRouter = express.Router()

orderRouter.get("/farmer-receive", isFarmer, controller.getFarmerReceiveOrder)
orderRouter.get("/farmer-receive-details/:orderId", isFarmer, controller.getFarmerReceiveOrderDetails)
orderRouter.patch("/farmer-change-status/:orderId", isFarmer, controller.changeFarmerOrderStatus)
orderRouter.get("/aratdar-placed", isAratdar, controller.getAratdarPlacedOrder)
orderRouter.get("/farmer-placed-details/:orderId", isAratdar, controller.getAratdarPlacedOrderDetails)

export default orderRouter