<<<<<<< HEAD
let db = require("../../models")
module.exports = function(app) {
    app.post("/api/createaccount", function(req, res) {
        db.Player.findOne({where:{email:req.body.email}}).then(function(data) {
            if (!data) {
                db.Player.create(req.body).then(function(data) {
                    res.json(data)
                })
            } else {
                res.end()
            }
=======
let db = require('../../models')
module.exports = function(app, game) {
    app.post('/api/createaccount', function(req, res) {
        db.Player.create(req.body).then(function(data) {
            res.json(data)
>>>>>>> 62d7d3b3dc87b2803bbff2d999f51e2efef42dee
        })
    })

    app.post('/api/login', function(req, res) {
        db.Player.findOne({where:{email:req.body.email}}).then(function(data) {
<<<<<<< HEAD
            if (data) {
                return res.json('/game')
            }
            res.end()
=======
            game.methods.addPlayer(req.body.number, data)
            res.json('/game')
>>>>>>> 62d7d3b3dc87b2803bbff2d999f51e2efef42dee
        })
    })
}