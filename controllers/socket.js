module.exports = function (io, game) {
    //Set up an event for a new connection
    io.on('connection', newConnection)

    //Function that runs when someone connects
    function newConnection(socket) {
        console.log(`New connection: ${socket.id}.`)
        let timer = setTimeout(askForIdentification, 500)
        //Set up an event for when a player identifies itself
        socket.on('identifier', identifyPlayer)

        //Set up an event for when a player sends a command
        socket.on('command', parseCommand)

        //Set up an event for when a player sends a message
        socket.on('chat', updateChat)

        //Set up an event for when a player disconnects
        socket.on('disconnect', removePlayer)

        socket.on('stats', sendStats)

        socket.on('inventory', sendInventory)

        function askForIdentification() {
            console.log('ID not recieved')
            socket.emit('identify', 'Please make ajax request')
        }

        //When a player identifies themselves you connect the player obj to the socket connection
        function identifyPlayer(data) {
            clearTimeout(timer)
            game.methods.associatePlayer(data, socket.id)
            if (!game.players[socket.id]) {
                return
            }
            game.players[socket.id].socket = socket
            sendInventory()
            let newRoom = game.players[socket.id].room
            updatePlayerLocation(undefined, newRoom)
        }

        //When a player sends a command respond accordingly
        function parseCommand(data) {
            if (!game.players[socket.id]) {
                return
            }
            //Make the whole string lowercase and split the command into the command and modifier
            let string = data.toLowerCase()
            let command = string.split(' ')[0]
            let modifier = string.split(' ').slice(1).join(' ')
            if (game.players[socket.id][`${command}Command`]) {
                let previousRoom = game.players[socket.id].room
                game.players[socket.id][`${command}Command`](modifier)
                sendInventory()
                if (command === 'move' && previousRoom !== game.players[socket.id].room) {
                    updatePlayerLocation(previousRoom, game.players[socket.id].room)
                }
            } else {
                socket.emit('command-response', { message: 'Invalid command' })
            } 
        }

        //When chat is recieved send out a message to everyone else, attatching the player name
        function updateChat(data) {
            if (!game.players[socket.id]) {
                return
            }
            socket.broadcast.emit('chat', { user: game.players[socket.id].name, message: data })
            // console.log(data)
        }

        //Call the game obj method to remove a given player
        function removePlayer() {
            if (!game.players[socket.id]) {
                return
            }
            let room = game.players[socket.id].room
            updatePlayerLocation(room)
            game.methods.removePlayer(socket.id)
        }

        function sendInventory() {
            if (!game.players[socket.id]) {
                return
            }
            console.log('Sending inventory information')
            let player = game.players[socket.id]
            socket.emit('inventory', {
                energyDrinks: player.inventory.find(item => item.item_name === 'energy drink') || 0,
                sportsDrinks: player.inventory.find(item => item.item_name === 'sports drink') || 0,
                coffees: player.inventory.find(item => item.item_name === 'coffee') || 0,
                mechanicalKeyboards: player.inventory.find(item => item.item_name === 'mechanical keyboards') || 0,
                ssds: player.inventory.find(item => item.item_name === 'solid-state drive') || 0,
                opticalMice: player.inventory.find(item => item.item_name === 'optical mouse') || 0,
            })
        }

        function sendStats() {
            if (!game.players[socket.id]) {
                return
            }
            let player = game.players[socket.id]
            socket.emit('stats', {
                player_name: player.name,
                level: player.level,
                exp: player.exp,
                hp: player.hp,
                stressLimit: player.level * 10,
                mp: player.mp,
                attack: player.attack,
                defense: player.defense,
                currency: player.currency
            })
        }

        function updatePlayerLocation(previousRoom, newRoom) {
            if (previousRoom === newRoom) {
                return
            }
            for(let key in game.players) {
                if (key === socket.id) {
                    continue
                }
                let otherPlayer = game.players[key]
                let messageName
                if (otherPlayer.room === newRoom) {
                    messageName = 'player-joined'
                } else if (otherPlayer.room === previousRoom) {
                    messageName = 'player-left'
                }
                io.to(otherPlayer.socket.id).emit(messageName, game.players[socket.id].name)
                socket.emit(messageName, otherPlayer.name)
            }
        }
    }
}
