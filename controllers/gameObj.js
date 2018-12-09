let Player = require('./playerObj')
let Enemy = require('./enemyObj')
let db = require('../models')

let game = {
    //This is the list of players in object form for easier manipulation
    players: {},

    //This is the list of enemies in object form for easier manipulation
    enemies: {},
    
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
        },

        //When a player connects on socket associate that socket id with the player object already created
        associatePlayer: function(tempKey, socketId) {
            //Store the object in a temporary variable
            let temp = game.players[tempKey]
            //Delete the reference to the player stored in the temporary spot
            delete game.players[tempKey]
            //Store the object at it's new location: the player's soccket connection id
            game.players[socketId] = temp
            //Set reference in the player object to the socket id in case it's needed
            game.players[socketId].reference = socketId
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

        removePlayer: function(key) {
            if (game.players[key]) {
                this.saveState(() => {
                    delete game.players[key]
                    console.log('Player removed')
                },[key])
                
            }
        },

        saveState: function(cb, playerKeys = Object.keys(game.players)) {
            for(let i = 0; i < playerKeys.length; i++) {
                let player = game.players[playerKeys[i]]
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
                }).then(cb)
            }
        }
    }
}

module.exports = game