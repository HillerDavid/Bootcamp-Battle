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

        //Set up an event for when a player sends a message
        socket.on('chat', updateChat)

        //Set up an event for when a player disconnects
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

            if (command === 'attack') {
                //If the player has the ability to attack right now
                if (game.players[socket.id].canAttack()) {
                    console.log('Player attacked')
                    socket.emit('command-response', `${game.players[socket.id].player_name} attacks!`)
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
                        enemyAttack()
                        // setTimeout(enemyAttack, 2000)
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

            if (command === 'buy') {
                //Split the command into quantity and item
                let quantity = modifier.split(' ')[0]
                let item = modifier.split(' ').slice(1).join(' ')
                //If quantity is a number they are trying to by a specific number of an item
                if (!isNaN(parseInt(quantity))) {
                    quantity = parseInt(quantity)
                    //If quantity is less than 0 quit
                    if (quantity < 0) {
                        return
                    }

                //Otherwise the items is the whole string and quantity is assumed to be 1
                } else {
                    item = modifier
                    quantity = 1
                }
                //If that item exists
                if (game.items[item]) {
                    //If the player has enough money
                    if (game.players[socket.id].currency - game.items[item].cost * quantity >= 0) {
                        //Charge the player
                        game.players[socket.id].currency -= game.items[item].cost * quantity
                        //Give the player their items and save them in the database
                        game.methods.giveItem(game.players[socket.id], game.items[item], quantity, true)
                    }
                }
                return
            }

            if (command === 'money') {
                //For testing purposes give the player 100 cred
                game.players[socket.id].currency += 100
            }

            if (command === 'console') {
                //console.log that players info
                console.log(game.players[socket.id].print())
                return
            }

            if (command === 'move') {
                //Execute the command for the player
                game.players[socket.id].move(modifier)
                socket.emit('command-response', `${game.players[socket.id].player_name} has moved to ${modifier}!`)
                //If the player moves to the class create an enemy for that player
                if (modifier === 'class') {
                    game.methods.createEnemy([game.players[socket.id]])
                }
                return
            }

            if (command === 'save') {
                //Save the whole game
                game.methods.saveState()
                socket.emit('command-response', `${game.players[socket.id].player_name} game is saved!`)
                return
            }

            if (command === 'sleep') {
                //If the player can sleep, they sleep
                if (game.players[socket.id].sleep()) {
                    console.log(`${game.players[socket.id].player_name} slept and is back to 0 stress(hp)`)
                    socket.emit('command-response', `${game.players[socket.id].player_name} slept and is back to 0 stress(hp).`)
                    return
                }
                console.log(`${game.players[socket.id].player_name} is unable to sleep`)
                return
            }
            
        }

        //When chat is recieved send out a message to everyone else, attatching the player name
        function updateChat(data) {
            socket.broadcast.emit('chat', {user: game.players[socket.id].player_name, message: data})
        }

        //Call the game obj method to remove a given player
        function removePlayer() {
            game.methods.removePlayer(socket.id)
        }

        //When the alarm goes off the enemy attacks
        function enemyAttack() {
            game.players[socket.id].currentEnemy.attackCommand()
        }
    }
}
