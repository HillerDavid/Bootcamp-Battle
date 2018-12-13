$('#login-button').on('click', function () {
    event.preventDefault()
    let email = $('#input-email').val().trim()
    let password = $('#input-password').val().trim()
    let number = Math.floor(Math.random() * 1000000)
    let userData = {
        email,
        password,
        number
    }
    if (!userData.email || !userData.password) {
        return
    }
    logInUser(userData)
    $('#input-email').val('')
    $('#input-password').val('')
    $('#input-user').val('')

})

$('#register-button').on('click', function () {
    event.preventDefault()
    let email = $('#input-email').val().trim()
    let password = $('#input-password').val().trim()
    let player_name = $('#input-user').val().trim()
    let userData = {
        email,
        password,
        player_name
    }
    if (!userData.email || !userData.password || !userData.player_name) {
        return
    }
    signUpUser(userData)
    $('#input-email').val('')
    $('#input-password').val('')
    $('#input-user').val('')
})

function signUpUser(userData) {
    $.post('/api/createaccount', userData).then(() => {

    })
}

function logInUser(userData) {
    $.post('/api/login', userData).then((data) => {
        localStorage.number = userData.number
        window.location.replace(data)
    })
}