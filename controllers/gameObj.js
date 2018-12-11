let Player = require('./playerObj')
let Enemy = require('./enemyObj')
let Item = require('./itemObj')
let db = require('../models')

let game = {
    //This is the list of players in object form for easier manipulation
    players: {},

    //This is the list of enemies in object form for easier manipulation
    enemies: {},

    items: {
        'health potion': {
            item_name: 'health potion',
            cost: 10,
            attack: 0,
            defense: 0,
            hp: 10,
            mp: 0,
            equippable: false,
            usable: true
        },
        'sword': {
            item_name: 'sword',
            cost: 50,
            attack: 5,
            defense: 0,
            hp: 0,
            mp: 0,
            equippable: true,
            usable: false
        },
        'shield': {
            item_name: 'shield',
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

            //Loop through all of the items in the database belonging to the player and add them to the player's inventory
            for(let item of data.Items) {
                game.methods.giveItem(game.players[tempKey], item.item_name, item.attack, item.defense, item.hp, item.mp, item.equipped)
            }
        },

        //When a player connects on socket associate that socket id with the player object already created
        associatePlayer: function(tempKey, socketId) {
            if (game.players[tempKey]) {
                //Store the object in a temporary variable
                let temp = game.players[tempKey]
                //Delete the reference to the player stored in the temporary spot
                delete game.players[tempKey]
                //Store the object at it's new location: the player's soccket connection id
                game.players[socketId] = temp
                //Set reference in the player object to the socket id in case it's needed
                game.players[socketId].reference = socketId
            }
        },

        //Create an enemy object in the game enemy object list and associate it with a player
        createEnemy: function(players) {
            //Create the reference where the enemy will be kept
            game.enemies[players[0].reference] = {}
            //Create the enemy object and put it in it's location, giving it an array of players it is fighting
            game.enemies[players[0].reference] = new Enemy('assignment', 1, 1, 2, 100, players[0].reference, players)
            //Loop through the players
            for(let player of players) {
                //If the player isn't currently fighting an enemy
                if (!player.currentEnemy) {
                    //Set the player's currentEnemy to this one
                    player.currentEnemy = game.enemies[players[0].reference]
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
                    console.log(player.inventory)
                    return
                }
            }

            //If the player didn't already have the item in their inventory add it
            player.inventory.push(new Item(item.item_name, item.attack, item.defense,
                item.hp, item.mp, item.equippable, item.usable, false))

            //Save the item if it should be saved
            if (shouldSave) {
                game.methods.saveItem(player, player.inventory[player.inventory.length - 1])
            }

            //If the item didn't previously exist in their inventory the loop didn't add them, so call the method again to add the rest
            game.methods.giveItem(player, item, quantity - 1, shouldSave)
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
                attack: item.attack,
                defense: item.defense,
                hp: item.hp,
                mp: item.mp,
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
                //Update the database with their info
                db.Player.update({
                    attack: player.attack,
                    defense: player.defense,
                    hp: player.hp,
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
        }
    }
}

module.exports = game