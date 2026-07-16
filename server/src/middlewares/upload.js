import multer from 'multer'

const storage = multer.memoryStorage()
const upload  = multer({storage}).any()

export default upload