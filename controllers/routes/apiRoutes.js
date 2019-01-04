let db = require('../../models')
let passport = require('../../config/passport')
let isAuthenticated = require('../../config/middleware/isAuthenticated')
module.exports = function(app, game) {
    app.post('/api/createaccount', function(req, res) {
        db.Player.findOne({ where: { email:req.body.email } }).then(function(data) {
            console.log('test')
            if (!data) {
                console.log('player created')
                db.Player.create(req.body).then(function(data) {
                    res.json(data)
                })
            } else {
                console.log('player not created')
                res.end()
            }
        })
    })

    app.post('/api/login', passport.authenticate('local'), function(req, res) {
        db.Player.findOne({where:{email:req.body.email}, include: [db.Item]}).then(function(data) {
            if (data) {
                return res.json('/game')
            }
            res.end()
        })
    })

    app.post('/api/identify', isAuthenticated, function(req, res) {
        for(let key in game.players) {
            if (game.players[key].hiddenNumber === req.body.number) {
                return
            }
        }
        db.Player.findOne({where:{email:req.user.email}, include: [db.Item]}).then(function(data) {
            if (data) {
                for(let key in game.players) {
                    let player = game.players[key]
                    if (player.player_id === req.user.id) {
                        res.status(400)
                        res.send('/')
                        return
                    }
                }
                game.methods.addPlayer(req.body.number, data)
                res.status(200)
                res.send()
            } else {
                res.status(500)
                res.send('/')
            }
        })
    })

    // Test route for stats **BEGIN**
    // app.get('/api/statistics', (req, res) => {
    //     db.Player.findOne({where:{player_name: 'Zenmaioh'}}).then(data => {
    //         res.json(data)
    //     })
    // })
}