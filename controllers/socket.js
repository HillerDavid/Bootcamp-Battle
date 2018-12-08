module.exports = function(io, cb) {
    io.on('connection', newConnection)

    function newConnection(socket) {
        console.log(`New connection: ${socket.id}.`)
        socket.on('identifier', identifyPlayer)

        function identifyPlayer(data) {
            cb(data, socket.id)
        }
    }
}