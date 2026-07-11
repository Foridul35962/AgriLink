const errorHandler = (error, req, res, next) => {
    const statusCode = error.status || 500
    return res
        .status(statusCode)
        .json({
            success: error.success || false,
            message: error.message || "Internet server error",
            error: error.error || [],
            data: error.data || null
        })
}

export default errorHandler