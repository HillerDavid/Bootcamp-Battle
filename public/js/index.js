$('#login-btn').on('click', function() {
    event.preventDefault()
    let email = $('#input-email').val()
    let password = $('#input-password').val()
    let number = Math.floor(Math.random() * 1000000)
    $.post('/api/login', { email: email, password: password, number: number }).then((data) => {
        console.log('Test')
        localStorage.number = number
        window.location.replace(data)
    })
})
