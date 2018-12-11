let db = require('../../models')
let passport = require('../../config/passport')
module.exports = function(app, cb) {
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
                cb(req.body.number, data)
                return res.json('/game')
            }
            res.end()
        })
    })
}