import dotenv from 'dotenv'
dotenv.config()
import app from "./src/app.js";
import connectDB from './src/config/db.js'
import { startServer } from './src/config/redis.js'

const PORT = process.env.PORT || 5000

startServer().then(() => {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`server is started at http://localhost:${PORT}`)
        })
    }).catch((err) => {
        console.log('mongodb connect failed', err)
    })
}).catch((err) => {
    console.log('redis connect failed', err)
})