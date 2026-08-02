import express from "express"
import * as controller from "../controllers/crop.controller.js"
import protect from "../middlewares/protect.js"
import isAdmin from "../middlewares/isAdmin.js"

const cropRouter = express.Router()

cropRouter.post("/create", protect, isAdmin, controller.createCrop)
cropRouter.get("/all", controller.getAllCrop)
cropRouter.get("/details/:cropId", controller.getCrop)
cropRouter.patch("/update/:cropId", protect, isAdmin, controller.updateCrop)
cropRouter.delete("/delete/:cropId", protect, isAdmin, controller.deleteCrop)
cropRouter.post("/create/recommendation", protect, controller.createCropRecommendation)
cropRouter.patch("/update/recommendation", protect, controller.updateCropRecommendation)
cropRouter.delete("/delete/recommendation/:cropRecommendationId", protect, controller.deleteCropRecommendation)

export default cropRouter
