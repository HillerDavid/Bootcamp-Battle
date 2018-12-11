let db = require('../../models')
let isAuthenticated = require('../../config/middleware/isAuthenticated')

module.exports = function (app) {
    // Load index page and pass in the index header
    app.get('/', function (req, res) {
        res.render('index', {whichPartial: function(){
            return 'indexHead'
        }})
    })

    // Load game page and pass in the game header
    app.get('/game', isAuthenticated, function (req, res) {
        res.render('game', {whichPartial: function(){
            return 'gameHead'
        }})
    })

    // // Render 404 page for any unmatched routes
    // app.get('*', function (req, res) {

    // })
}