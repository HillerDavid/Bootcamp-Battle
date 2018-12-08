let Player = require('./playerObj')

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
        }
    }
}

module.exports = game