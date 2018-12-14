module.exports = function (io, game) {
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
            if (!game.players[socket.id]) {
                return
            }
            let newRoom = game.players[socket.id].room
            updatePlayerLocation(undefined, newRoom)
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
                    let previousRoom = game.players[socket.id].room
                    console.log('Player attacked')
                    socket.emit('command-response', {message: `${game.players[socket.id].name} attacks...`, alertType: 'secondary'})
                    let enemy = game.players[socket.id].currentEnemy
                    //The player attackCommand returns whether the enemy they are fighting is still alive or not
                    if (!game.players[socket.id].attackCommand()) {
                        console.log('Enemy is dead')
                        socket.emit('command-response', {message: `You defeated ${enemy.name}`, alertType: 'success'})
                        if (game.players[socket.id].currentEnemy) {
                            //Get the reference to the enemy in the game object
                            let enemyIndex = game.players[socket.id].currentEnemy.reference
                            //Give all the players that fought it their portion of the exp and set their currentEnemy = false
                            game.enemies[enemyIndex].payout()
                            game.players[socket.id].levelUp()
                            //Delete the enemy from the game object
                            delete game.enemies[enemyIndex]
                                                    
                        } else {
                            updatePlayerLocation(previousRoom, game.players[socket.id].room)
                            socket.emit('command-response', {message: `${game.players[socket.id].name} defeated ${enemy.name}`, alertType: 'success'})
                            io.to(enemy.reference).emit('command-response', {message: `${game.players[socket.id].name} hits for ${game.players[socket.id].attackDamage}`, alertType: 'danger'})
                            io.to(enemy.reference).emit('command-response', {message:  `The stress is too much! ${enemy.name} fainted.`})
                            io.to(enemy.reference).emit('command-response', {message:  `${enemy.name} wakes up energized and ready to try again!`, level: enemy.room})
                        }

                        //If the enemy can attack
                    } else {
                        socket.emit('command-response', {message: `${game.players[socket.id].name} hits for ${game.players[socket.id].attackDamage}`, alertType: 'secondary'})
                        if (game.players[socket.id].currentEnemy.canAttack()) {
                            console.log('Enemy is alive and will attack')
                            //Set a timer so it will attack after 2 seconds
                            if (!enemy.level) {
                                if (!enemy.attackCommand()) {
                                    updatePlayerLocation(previousRoom, game.players[socket.id].room)
                                    socket.emit('command-response', {message: `${enemy.name} hits for ${enemy.attackDamage}`, alertType: 'danger'})
                                    socket.emit('command-response', {message:  `The stress is too much! ${game.players[socket.id].name} fainted.`})
                                    socket.emit('command-response', {message:  `${game.players[socket.id].name} wakes up energized and ready to try again!`, level: game.players[socket.id].room})
                                } else {
                                    socket.emit('command-response', {message: `${enemy.name} hits for ${enemy.attackDamage}`, alertType: 'danger'})
                                }
                            } else {
                                io.to(enemy.reference).emit('command-response', {message: `${game.players[socket.id].name} hits for ${game.players[socket.id].attackDamage}`, alertType: 'secondary'})
                            }
                            
                        } else {
                            //Some players have not attacked yet, so it is still their turn
                            console.log(`Enemy is alive but can't attack yet`)
                        }
                    }
                } else {
                    //The player has already attacked and it is not their turn again yet
                    console.log(`${game.players[socket.id].name} cannot attack yet`)
                    socket.emit('command-response', {message: `${game.players[socket.id].name} cannot attack yet`})
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
                        console.log(`Item ${item} purchased`)
                    }
                }
                return
            }

            if  (command === 'challenge') {
                if (game.players[socket.id].room === 'panera') {
                    for(let key in game.players) {
                        let player = game.players[key]
                        if (player.name.toLowerCase() === modifier) {
                            console.log('Player found')
                            if (player.room === 'panera') {
                                io.to(player.reference).emit('command-response', {message: `${game.players[socket.id].name} challenged you`})
                                player.challenges.push(socket.id)
                            } else {
                                socket.emit('command-response', {message: `${player.name} is not at Panera`})
                            }
                            return 
                        }
                    }
                    socket.emit('command-response', {message: `There is no player with the name ${modifier}`})
                    return
                }
                socket.emit('command-response', {message: 'PvP combat must be done at Panera'})
                return
            }

            if (command === 'accept') {
                for(let i = 0; i < game.players[socket.id].challenges.length; i++) {
                    let player = game.players[game.players[socket.id].challenges[i]]
                    if (player.name.toLowerCase() === modifier) {
                        game.players[socket.id].currentEnemy = player
                        player.currentEnemy = game.players[socket.id]
                        game.players[socket.id].challenges.splice(i, 1)
                        socket.emit('command-response', {message: `You are now fighting ${player.name}.\nYou were challenged, so you go first.`})
                        io.to(player.reference).emit('command-response', {message: `You are now fighting ${player.name}.\nYou challenged them, so they go first.`})
                        player.attacked = true
                        return
                    }
                }
                socket.emit('command-response', {message: `There is no challenge from ${modifier}`})
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
                let previousRoom = game.players[socket.id].room
                game.players[socket.id].move(modifier)
                let newRoom = game.players[socket.id].room
                updatePlayerLocation(previousRoom, newRoom)
                if (modifier === 'vending machine') {
                    modifier = 'vending-machine'
                }
                socket.emit('command-response', {message: `${game.players[socket.id].name} has moved to ${game.players[socket.id].room}!`, level: `${game.players[socket.id].room}`})
                //If the player moves to the class create an enemy for that player
                if (modifier === 'class') {
                    game.methods.createEnemy([game.players[socket.id]])
                    if (game.enemies[socket.id]) {
                        socket.emit('command-response', {message: `${game.players[socket.id].name} has been given a(n) ${game.enemies[socket.id].name}!`, alertType:'danger'})
                    }
                }
                return
            }

            if (command === 'save') {
                //Save the whole game
                game.methods.saveState()
                socket.emit('command-response', {message: `${game.players[socket.id].name} game is saved!`})
                return
            }

            if (command === 'sleep') {
                //If the player can sleep, they sleep
                if (game.players[socket.id].sleep()) {
                    console.log(`${game.players[socket.id].name} slept and is back to 0 stress(hp)`)
                    socket.emit('command-response', {message:`${game.players[socket.id].name} slept and is back to 0 stress(hp).`})
                    return
                }
                console.log(`${game.players[socket.id].name} is unable to sleep`)
                return
            }

            if (command === 'use') {
                for(let i = 0; i < game.players[socket.id].inventory.length; i++) {
                    let item = game.players[socket.id].inventory[i]
                    if (item.item_name === modifier) {
                        console.log('Item found')
                        if (item.usable) {
                            if (!item.use()) {
                                game.players[socket.id].inventory.splice(i, 1)
                            }
                            for(let key in item) {
                                if (game.players[socket.id][key]) {
                                    if (game.players[socket.id][key] + item[key] > 0) {
                                        game.players[socket.id][key] += item[key]
                                    } else {
                                        game.players[socket.id][key] = 0
                                    }  
                                }
                            }
                        }
                        return
                    }
                }
                console.log(`Item ${modifier} not found`)
            }

        }

        //When chat is recieved send out a message to everyone else, attatching the player name
        function updateChat(data) {
            socket.broadcast.emit('chat', { user: game.players[socket.id].name, message: data })
            console.log(data)
        }

        //Call the game obj method to remove a given player
        function removePlayer() {
            let room = game.players[socket.id].room
            updatePlayerLocation(room)
            game.methods.removePlayer(socket.id)
        }

        function updatePlayerLocation(previousRoom, newRoom) {
            for(let key in game.players) {
                if (key === socket.id) {
                    continue
                }
                let player = game.players[key]
                let messageName
                if (player.room === newRoom) {
                    messageName = 'player-joined'
                } else if (player.room === previousRoom) {
                    messageName = 'player-left'
                }
                io.to(player.reference).emit(messageName, game.players[socket.id].name)
                socket.emit(messageName, player.name)
            }
        }
    }
}
