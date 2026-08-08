import express from "express"
import * as controller from "../controllers/inventory.controller.js"
import protect from "../middlewares/protect.js"
import isAratdar from "../middlewares/isAratdar.js"
import upload from "../middlewares/upload.js"

const inventoryRouter = express.Router()

inventoryRouter.post("/add", protect, isAratdar, upload, controller.addInventory)
inventoryRouter.patch("/edit/:inventoryId", protect, isAratdar, upload, controller.editInventory)
inventoryRouter.delete("/delete/:inventoryId", protect, isAratdar, controller.deleteInventory)
inventoryRouter.get("/my", protect, isAratdar, controller.getMyInventories)
inventoryRouter.get('/details/:inventoryId', protect, controller.getInventoryDetails)
inventoryRouter.get("/all", protect, controller.getAllInventories)

export default inventoryRouter