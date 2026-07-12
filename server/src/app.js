import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import errorHandler from './helpers/ErrorHandler.js'
import authRouter from './routes/auth.route.js'
import adminRouter from './routes/admin.route.js'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

app.get('/', (req, res) => {
    res.send("AgriLink server is running ...")
})

app.use(errorHandler)

export default app