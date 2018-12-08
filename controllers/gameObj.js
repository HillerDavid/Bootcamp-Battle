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
            console.log(game.players)
        },
        createEnemy: function(playerList) {
            game.enemies[playerList[0]] = {}
            let players = []
            for(let i = 0; i < playerList.length; i++) {
                players.push(game.players[playerList[0]])
            }
            game.enemies[playerList[0]] = new Enemy('assignment', 1, 1, 100, 100, players)
        }
    }
}

module.exports = game