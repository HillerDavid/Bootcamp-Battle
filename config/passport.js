let passport = require('passport')
let localStrategy = require('passport-local').Strategy

let db = require('../models')

passport.use(new localStrategy(
    {
        usernameField: 'email'
    },
    function(email, password, done) {
        db.Player.findOne({
            where: {
                email: email
            }
        }).then(function(user) {
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect email.'
                })
            } else if (!user.validPassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                })
            }
            return done(null, user)
        })
    }
))

passport.serializeUser(function(user, cb) {
    cb(null, user)
})

passport.deserializeUser(function (obj, cb) {
    cb(null, obj)
})

module.exports = passport