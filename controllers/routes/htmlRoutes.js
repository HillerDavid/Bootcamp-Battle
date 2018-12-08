var db = require('../../models')

module.exports = function (app) {
    // Load index page and pass in the index header
    app.get('/', function (req, res) {
        db.Example.findAll({}).then(function () {
            res.render('index', {whichPartial: function(){
                return 'indexHead'
            }})
        })
    })

    // Load game page and pass in the game header
    app.get('/game', function (req, res) {
        db.Example.findAll({}).then(function () {
            res.render('game', {whichPartial: function(){
                return 'gameHead'
            }})
        })
    })

    // // Render 404 page for any unmatched routes
    // app.get('*', function (req, res) {

    // })
}