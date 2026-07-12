import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const protect = AsyncHandler(async(req, res, next)=>{
    const {token} = req.cookies
    if (!token) {
        throw new ApiErrors(401, "user is not authenticated")
    }

    const decode = jwt.verify(token, process.env.TOKEN_SECRET)
    if (!decode) {
        throw new ApiErrors(401, "user is not authenticated")
    }

    const userId = decode.userId
    const role = decode.role

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiErrors(401, "user is not authenticated")
    }

    const user = {
        _id: userId,
        role
    }

    req.user = user

    next()
})

export default protect