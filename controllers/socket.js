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
                if (command === 'move') {
                    game.players[socket.id][`${command}Command`](modifier)
                    if (modifier === 'class') {
                        game.methods.createEnemy([game.players[socket.id]])
                    }
                    return
                }
                if (command === 'attack') {
                    if (game.players[socket.id].canAttack()) {
                        console.log('Player attacked')
                        if (!game.players[socket.id].attackCommand()) {
                            console.log('Enemy is dead')
                            let playerList = game.players[socket.id].currentEnemy.players
                            delete game.enemies[game.players[socket.id].currentEnemy.reference]
                            for(let i = 0; i < playerList.length; i++) {
                                playerList[i].currentEnemy = false
                                playerList[i].attacked = false
                            }
                        } else if (game.players[socket.id].currentEnemy.canAttack()){
                            console.log('Enemy is alive and will attack')
                            setTimeout(enemyAttack, 2000)
                        } else {
                            console.log(`Enemy is alive but can't attack yet`)
                        }
                    } else {
                        console.log(`${game.players[socket.id].player_name} cannot attack yet`)
                    }
                    return
                }
            }
            if (command === 'console') {
                console.log(game.players[socket.id].print())
            }
        }

        function enemyAttack() {
            game.players[socket.id].currentEnemy.attackCommand()
        }
    }
}
