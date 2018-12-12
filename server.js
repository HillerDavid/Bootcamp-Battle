/* eslint-disable no-console */
/* eslint-disable no-undef */
require('dotenv').config()
let express = require('express')
let exphbs = require('express-handlebars')
let session = require('express-session')
let passport = require('./config/passport')

let db = require('./models')

let app = express()
let server = require('http').Server(app)
let io = require('socket.io')(server)
let PORT = process.env.PORT || 3000

// Middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))

app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

// Handlebars
app.engine(
    'handlebars',
    exphbs({
        defaultLayout: 'main',
        partialsDir: __dirname + '/views/partials'
    })
)

app.set('view engine', 'handlebars')

let game = require('./controllers/gameObj')

// Routes
require('./controllers/routes/apiRoutes')(app, game)
require('./controllers/routes/htmlRoutes')(app)
require('./controllers/socket')(io, game)

let syncOptions = { force: false }

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === 'test') {
    syncOptions.force = true
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
    server.listen(PORT, function() {
        console.log(
            '==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.',
            PORT,
            PORT
        )
    })
})

module.exports = app
