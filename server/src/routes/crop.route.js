import express from "express"
import * as controller from "../controllers/crop.controller.js"
import protect from "../middlewares/protect.js"
import isAdmin from "../middlewares/isAdmin.js"
import upload from "../middlewares/upload.js"

const cropRouter = express.Router()

cropRouter.post("/create", protect, isAdmin, upload, controller.createCrop)
cropRouter.get("/all", controller.getAllCrop)
cropRouter.get("/details/:cropId", controller.getCrop)
cropRouter.patch("/update/:cropId", protect, isAdmin, upload, controller.updateCrop)
cropRouter.delete("/delete/:cropId", protect, isAdmin, controller.deleteCrop)
cropRouter.post("/create/recommendation", protect, isAdmin, controller.createCropRecommendation)
cropRouter.patch("/update/recommendation", protect, isAdmin, controller.updateCropRecommendation)
cropRouter.delete("/delete/recommendation/:cropRecommendationId", protect, isAdmin, controller.deleteCropRecommendation)

export default cropRouter
