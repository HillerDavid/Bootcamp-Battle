module.exports = function(io) {
    io.on('connection', newConnection)

    function newConnection(socket) {
        console.log(`New connection: ${socket.id}.`)
    }
}