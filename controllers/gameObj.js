let Player = require('./playerObj')
let Enemy = require('./enemyObj')

let game = {
    players: {},
    enemies: {},
    methods: {
        addPlayer: function(tempKey, data) {
            game.players[tempKey] = {}
            game.players[tempKey] = new Player(data.id, data.player_name, data.attack,
                data.defense, data.hp, data.mp, data.currency, data.homework_completed,
                data.exp, data.level)
        },
        associatePlayer: function(tempKey, socketId) {
            let temp = game.players[tempKey]
            delete game.players[tempKey]
            game.players[socketId] = temp
            game.players[socketId].reference = socketId
        },
        createEnemy: function(players) {
            game.enemies[players[0].reference] = {}
            game.enemies[players[0].reference] = new Enemy('assignment', 1, 1, 2, 100, players[0].reference, players)
            for(let i = 0; i < players.length; i++) {
                if (!game.players[players[i].reference].currentEnemy) {
                    game.players[players[i].reference].currentEnemy = game.enemies[players[0].reference]
                }
            }
        }
    }
}

module.exports = game