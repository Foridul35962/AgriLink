import express from "express"
import * as controller from "../controllers/product.controller.js"
import protect from "../middlewares/protect.js"
import isFarmer from "../middlewares/isFarmer.js"
import upload from "../middlewares/upload.js"

const productRouter = express.Router()

productRouter.post("/add", protect, isFarmer, upload, controller.addProduct)
productRouter.patch("/edit/:productId", protect, isFarmer, upload, controller.editProduct)
productRouter.delete("/delete/:productId", protect, isFarmer, upload, controller.deleteProduct)
productRouter.get("/all-my-product", protect, isFarmer, controller.getAllMyProducts)
productRouter.get("/:product", protect, controller.getProduct)

export default productRouter