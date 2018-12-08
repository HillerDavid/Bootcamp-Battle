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
            let command = string.split(' ')[0]
            let modifier = string.split(' ').slice(1).join(' ')
            if (game.players[socket.id][`${command}Command`]) {
                game.players[socket.id][`${command}Command`](modifier)
                if (command === 'move' && modifier === 'class') {
                    game.methods.createEnemy([game.players[socket.id]])
                }
                if (command === 'attack') {
                    if (game.players[socket.id].currentEnemy) {
                        if (!game.players[socket.id].currentEnemy.isAlive()) {
                            for(let i = 0; i < game.players[socket.id].currentEnemy.players.length; i++) {
                                game.players[socket.id].currentEnemy.players[i].currentEnemy = false
                            }
                            delete game.enemies[game.players[socket.id].currentEnemy.reference]
                        }
                    }
                } 
            }
        }
    }
}