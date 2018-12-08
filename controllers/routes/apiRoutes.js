let db = require('../../models')
module.exports = function(app, game) {
    app.post('/api/createaccount', function(req, res) {
        db.Player.create(req.body).then(function(data) {
            res.json(data)
        })
    })

    app.post('/api/login', function(req, res) {
        db.Player.findOne({where:{email:req.body.email}}).then(function(data) {
            game.methods.addPlayer(req.body.number, data)
            res.json('/game')
        })
    })
}