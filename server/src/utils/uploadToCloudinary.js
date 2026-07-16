import cloudinary from "../config/cloudinary.js"

const uploadToCloudinary = async (fileBuffer, folder) => {
    return await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder },
            (err, result) => {
                if (err) reject(err)
                else resolve(result)
            }
        ).end(fileBuffer)
    })
}

export default uploadToCloudinary