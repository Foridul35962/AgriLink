export const socketHandler = (io) => {
    io.on('connection', (socket) => {
        socket.on("joinUser", ({ userId }) => {
            socket.join(`user:${userId}`)
        })

        socket.on("joinBidding", ({ auctionId }) => {
            const room = `auction:${auctionId}`;
            socket.join(room);
        });

        socket.on("leaveBidding", ({ auctionId }) => {
            const room = `auction:${auctionId}`
            socket.leave(room)
        })

        socket.on("joinInventory", ({ inventoryId }) => {
            const room = `inventory:${inventoryId}`
            socket.join(room)
        })

        socket.on("leaveInventory", ({ inventoryId }) => {
            const room = `inventory:${inventoryId}`
            socket.leave(room)
        })
    })
}