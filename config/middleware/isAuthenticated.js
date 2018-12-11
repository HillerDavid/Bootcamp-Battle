module.exports = function(req, res, next) {
    if (req.player) {
        return next()
    }

    return res.redirect('/')
}