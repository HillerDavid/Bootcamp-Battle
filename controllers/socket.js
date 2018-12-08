module.exports = function(io, game) {
    io.on('connection', newConnection)

    function newConnection(socket) {
        console.log(`New connection: ${socket.id}.`)
        socket.on('identifier', identifyPlayer)
        socket.on('command', parseCommand)

        function identifyPlayer(data) {
            game.methods.associatePlayer(data, socket.id)
        }

        function parseCommand(data) {
            let string = data.toLowerCase()
            let command = data.split(' ')[0]
            let modifier = data.split(' ').slice(1).join(' ')
            if (game.players[socket.id][command]) {
                game.players[socket.id][command](modifier)
                if (command === 'move' && modifier === 'class') {
                    game.methods.createEnemy([socket.id])
                }
            }
        }
    }
}