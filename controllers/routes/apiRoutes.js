let db = require("../../models")
module.exports = function(app) {
    app.post("/api/createaccount", function(req, res) {
        db.Player.create(req.body).then(function(data) {
            res.json(data)
        })
    })

    app.post("/api/login", function(req, res) {
        db.Player.findOne({where:{email:req.body.email}}).then(function(data) {
            res.json(data)
        })
    })
}