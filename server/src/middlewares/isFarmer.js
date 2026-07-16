import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const isFarmer = AsyncHandler(async(req, res, next)=>{
    const user = req.user
    if (!user) {
        throw new ApiErrors
    }

    if (user.role !== "farmer") {
        throw new ApiErrors(401, "user is not authenticated")
    }

    next()
})

export default isFarmer