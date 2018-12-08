module.exports = function(io, game) {
    io.on('connection', newConnection)

    function newConnection(socket) {
        console.log(`New connection: ${socket.id}.`)
        socket.on('identifier', identifyPlayer)

        function identifyPlayer(data) {
            game.methods.associatePlayer(data, socket.id)
        }
    }
}