let game = {
    //This is the list of players in object form for easier manipulation
    players: {},

    //This is the list of enemies in object form for easier manipulation
    enemies: {},

    //This is the list of items in object form for easier manipulations
    items: {
        'energy drink': {
            item_name: 'energy drink',
            cost: 10,
            attack: 0,
            defense: 0,
            hp: -10,
            mp: 0,
            equippable: false,
            usable: true
        },
        'sports drink': {
            item_name: 'sports drink',
            cost: 10,
            attack: 0,
            defense: 0,
            hp: 0,
            mp: 10,
            equippable: false,
            usable: true
        },
        'coffee': {
            item_name: 'coffee',
            cost: 10,
            attack: 0,
            defense: 0,
            hp: -5,
            mp: 5,
            equippable: false,
            usable: true
        },
        'mechanical keyboard': {
            item_name: 'mechanical keyboard',
            cost: 50,
            attack: 5,
            defense: 0,
            hp: 0,
            mp: 0,
            equippable: true,
            usable: false
        },
        'solid-state drive': {
            item_name: 'solid-state drive',
            cost: 50,
            attack: 0,
            defense: 5,
            hp: 0,
            mp: 0,
            equippable: true,
            usable: false
        }
    },
    
    //This is the list of game methods in object form for easy of use
    methods: {
        //Add a player with a tempKey to the game player object
        addPlayer: function(tempKey, data) {
            //Create the reference where the player will be kept
            game.players[tempKey] = {}
            //Create a 'new' player from the data provided and store it in the reference spot
            game.players[tempKey] = new Player(data.id, data.player_name, data.attack,
                data.defense, data.hp, data.mp, data.currency, data.homework_completed,
                data.exp, data.level)

            console.log('Player added')

            game.players[tempKey].hiddenNumber = tempKey

            //Loop through all of the items in the database belonging to the player and add them to the player's inventory
            for(let item of data.Items) {
                // console.log(item.dataValues)
                game.methods.giveItem(game.players[tempKey], item.dataValues)
            }
        },

        //When a player connects on socket associate that socket id with the player object already created
        associatePlayer: function(tempKey, socketId) {
            if (game.players[tempKey]) {
                reassociate(tempKey)
                return
            }

            for(let key in game.players) {
                if (game.players[key].hiddenNumber === tempKey) {
                    reassociate(key)
                    return
                }
            }

            function reassociate(key) {
                //Store the object in a temporary variable
                let temp = game.players[key]
                //Delete the reference to the player stored in the temporary spot
                delete game.players[key]
                //Store the object at it's new location: the player's soccket connection id
                game.players[socketId] = temp
                console.log('Player associated!!!')
            }
        },

        //Create an enemy object in the game enemy object list and associate it with a player
        createEnemy: function(players) {
            let currentPlayer = players[0]
            let id = currentPlayer.socket.id
            //Create the reference where the enemy will be kept
            game.enemies[id] = {}
            //Create the enemy object and put it in it's location, giving it an array of players it is fighting

            game.enemies[id] = new Enemy('assignment', (currentPlayer.level * 2) + 4, currentPlayer.level, (currentPlayer.level * 5) + 9, currentPlayer.level * 40, currentPlayer.level * 40, id, players)

            //Loop through the players
            for(let player of players) {
                //If the player isn't currently fighting an enemy
                if (!player.currentEnemy) {
                    //Set the player's currentEnemy to this one
                    player.currentEnemy = game.enemies[id]
                }
            }
        },

        //Function that creates items, and adds them to players inventories
        giveItem: function(player, item, quantity = 1, shouldSave) {
            //Look through the players inventory
            for(let playerItem of player.inventory) {
                //If the item being given is already in their inventory
                if (playerItem.item_name === item.item_name) {
                    //Add one for every item being given (done in a loop for database reasons)
                    for(let i = 0; i < quantity; i++) {
                        playerItem.quantity++
                        if (shouldSave) {
                            game.methods.saveItem(player, playerItem)
                        }
                    }
                    // console.log(player.inventory)
                    return
                }
            }

            //If the player didn't already have the item in their inventory add it
            player.inventory.push(new Item(item.item_name, item.attack, item.defense,
                item.hp, item.mp, item.equippable, item.usable, false))
            player.inventory[player.inventory.length - 1].equipped = item.equipped

            //Save the item if it should be saved
            if (shouldSave) {
                game.methods.saveItem(player, player.inventory[player.inventory.length - 1])
            }
        },

        //Removes a certain quantity of an item from the database
        removeItem: function(player, item, quantity) {
            //Create the object to determine the query
            let destroyQuery = {
                where: {
                    PlayerId: player.player_id,
                    item_name: item.item_name
                }
            }
            //If quantity is provided only remove that many copies of the item
            if (quantity) {
                destroyQuery.limit = quantity
            }
            //Actually remove the items from the database
            db.Item.destroy(destroyQuery).then(() => {
                console.log('Item removed from the database')
            })
        },

        //Remove the player from the game obj
        removePlayer: function(key) {
            //If a player with that key exists
            if (game.players[key]) {
                //Call the save state function and make it delete the player
                this.saveState(() => {
                    delete game.players[key]
                    console.log('Player removed')
                },[key])
                
            }
        },

        //Save an item to the database
        saveItem: function(player, item) {
            db.Item.create({
                item_name: item.item_name,
                attack: item.effect.attack,
                defense: item.effect.defense,
                hp: item.effect.hp,
                mp: item.effect.mp,
                equippable: item.equippable,
                usable: item.usable,
                equipped: item.equipped,
                PlayerId: player.player_id
            }).then(() => {
                console.log('Item added to the database')
            })
        },

        //Save the player or players
        saveState: function(cb, playerKeys = Object.keys(game.players)) {
            //Loop through the players passed in, or all players
            for(let i = 0; i < playerKeys.length; i++) {
                //Set a player variable equal to the current player for ease of access
                let player = game.players[playerKeys[i]]

                if (player.currentEnemy && player.currentEnemy.level) {
                    player.currentEnemy.socket.emit('command-response', {message: 'You won!', alertType: 'success'})
                    player.currentEnemy.hp = 0
                    player.currentEnemy.attacked = false
                    player.currentEnemy.removeEffects()
                    player.currentEnemy.currentEnemy = undefined
                }

                player.removeEffects()
                //Update the database with their info
                db.Player.update({
                    attack: player.attack,
                    defense: player.defense,
                    hp: 0,
                    mp: player.mp,
                    currency: player.currency,
                    homework_completed: player.homework_completed,
                    exp: player.exp,
                    level: player.level
                }, {
                    where: {
                        id: player.player_id
                    }
                //Execute the callback when the save is done
                }).then(cb)
            }
        },

        updateItem: function(player, item) {
            db.Item.update({
                attack: item.effect.attack,
                defense: item.effect.defense,
                hp: item.effect.hp,
                mp: item.effect.mp,
                equipped: item.equipped
            }, {
                where: {
                    PlayerId: player.player_id,
                    item_name: item.item_name
                }
            }).then(() => {
                console.log('Item updated')
            })
        }
    }
}

module.exports = game

let Player = require('./playerObj')
let Enemy = require('./enemyObj')
let Item = require('./itemObj')
let db = require('../models')