export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        socket.on("joinUser", ({userId}) => {
            socket.join(`user:${userId}`)
        })
    })
}