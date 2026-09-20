import express from "express"
import * as controller from "../controllers/notification.controller.js"
import protect from "../middlewares/protect.js"

const notificationRouter = express.Router()

notificationRouter.get("/all", protect, controller.getAllNotification)
notificationRouter.patch("/read/:notificationId", protect, controller.readNotification)
notificationRouter.patch("/read-all", protect, controller.readAllNotification)
notificationRouter.get("/unread-count", protect, controller.getUnreadNotificationCount)
notificationRouter.delete("/delete/:notificationId", protect, controller.deleteNotification)

export default notificationRouter