import dotenv from 'dotenv'
dotenv.config()
import app from "./src/app.js";
import connectDB from './src/config/db.js'
import { startServer } from './src/config/redis.js'
import { Server } from 'socket.io';
import http from "http"
import { socketHandler } from './src/config/socket.js';

const PORT = process.env.PORT || 5000

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
})

app.set("io", io)

socketHandler(io)

startServer().then(() => {
    connectDB().then(() => {
        server.listen(PORT, () => {
            console.log(`server is started at http://localhost:${PORT}`)
        })
    }).catch((err) => {
        console.log('mongodb connect failed', err)
    })
}).catch((err) => {
    console.log('redis connect failed', err)
})