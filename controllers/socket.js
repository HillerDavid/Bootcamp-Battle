module.exports = function(io, game) {
    //Set up an event for a new connection
    io.on('connection', newConnection)

    //Function that runs when someone connects
    function newConnection(socket) {
        console.log(`New connection: ${socket.id}.`)
        //Set up an event for when a player identifies itself
        socket.on('identifier', identifyPlayer)

        //Set up an event for when a player sends a command
        socket.on('command', parseCommand)

        socket.on('disconnect', removePlayer)

        //When a player identifies themselves you connect the player obj to the socket connection
        function identifyPlayer(data) {
            game.methods.associatePlayer(data, socket.id)
        }

        //When a player sends a command respond accordingly
        function parseCommand(data) {
            //Make the whole string lowercase and split the command into the command and modifier
            let string = data.toLowerCase()
            let command = string.split(' ')[0]
            let modifier = string.split(' ').slice(1).join(' ')

            //Check if the player has a command corresponding to the command
            if (game.players[socket.id][`${command}Command`]) {
                if (command === 'move') {
                    //Execute the command for the player
                    game.players[socket.id][`${command}Command`](modifier)
                    //If the player moves to the class create an enemy for that player
                    if (modifier === 'class') {
                        game.methods.createEnemy([game.players[socket.id]])
                    }
                    return
                }
                if (command === 'attack') {
                    //If the player has the ability to attack right now
                    if (game.players[socket.id].canAttack()) {
                        console.log('Player attacked')
                        //The player attackCommand returns whether the enemy they are fighting is still alive or not
                        if (!game.players[socket.id].attackCommand()) {
                            console.log('Enemy is dead')
                            //Get the reference to the enemy in the game object
                            let enemyIndex = game.players[socket.id].currentEnemy.reference
                            //Give all the players that fought it their portion of the exp and set their currentEnemy = false
                            game.enemies[enemyIndex].payout()
                            //Delete the enemy from the game object
                            delete game.enemies[enemyIndex]

                        //If the enemy can attack
                        } else if (game.players[socket.id].currentEnemy.canAttack()){
                            console.log('Enemy is alive and will attack')
                            //Set a timer so it will attack after 2 seconds
                            setTimeout(enemyAttack, 2000)
                        } else {
                            //Some players have not attacked yet, so it is still their turn
                            console.log(`Enemy is alive but can't attack yet`)
                        }
                    } else {
                        //The player has already attacked and it is not their turn again yet
                        console.log(`${game.players[socket.id].player_name} cannot attack yet`)
                    }
                    return
                }
            }
            //If the command is console console.log that players info
            if (command === 'console') {
                console.log(game.players[socket.id].print())
                return
            }
            if (command === 'save') {
                game.methods.saveState()
                return
            }
        }

        function removePlayer() {
            game.methods.removePlayer(socket.id)
        }

        //When the alarm goes off the enemy attacks
        function enemyAttack() {
            game.players[socket.id].currentEnemy.attackCommand()
        }
    }
}
