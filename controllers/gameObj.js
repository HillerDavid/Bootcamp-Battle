let Player = require('./playerObj')

let game = {
    players: {},
    enemies: {},
    methods: {
        addPlayer: function(tempKey, data) {
            list.players[tempKey] = {}
            list.players[tempKey] = new Player(data.id, data.player_name, data.attack,
                data.defense, data.hp, data.mp, data.currency, data.homework_completed,
                data.exp, data.level)
        },
        associatePlayer: function(tempKey, socketId) {
            let temp = list.players[tempKey]
            delete list.players[tempKey]
            list.players[socketId] = temp
            console.log(list.players)
        }
    }
}

module.exports = game