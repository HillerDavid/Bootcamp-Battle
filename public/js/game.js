let socket = io.connect()
let gitBashed

$('#stats-tab').on('click', event => {
    socket.emit('stats', 'EXPLAAAIIIINNN TOOO MEEEE')
})

$('#inventory-tab').on('click', event => {
    // socket goes here
})

socket.on('stats', displayStats)

displayInventory = data => {
    console.log(data)
    $('#energy-drink-count').text('0')
    $('#sports-drink-count').text('0')
    $('#coffee-count').text('0')
    $('#mechanical-keyboard-count').text('0')
    $('#ssd-count').text('0')
    $('#optical-mouse-count').text('0')
}

function displayStats(data) {
    console.log(data)
    $('#stats-player-name').text('Username: ' + data.player_name)
    $('#stats-level').text('Level: ' + data.level)
    $('#stats-experience').text('Exp: ' + data.exp)
    $('#stats-stress').text('Stress(HP) ' + data.hp + '/' + data.stressLimit + ' (Stress Limit)')
    $('#stats-mp').text('Endurance(MP): ' + data.mp)
    $('#stats-attack').text('Front End(Attack): ' + data.attack)
    $('#stats-defense').text('Back End(Defense): ' + data.defense)
    $('#stats-currency').text('Nerd Cred(Currency): ' + data.currency)
}

socket.on('identify', identify)
socket.on('chat', incomingChat)
socket.on('command-response', (response) => {
    socket.emit('stats', 'EXPLAAAIIIINNN TOOO MEEEE')
    let color
    switch (response.alertType) {
    case 'danger':
        color = '#f00'
        break
    case 'secondary':
        color = '#fff'
        break
    case 'success':
        color = 'ff0'
        break
    default:
        color = ''
    }
    gitBashed.echo(`[[;${color};]${response.message}]`)
    if (response.level) {
        if (response.level.indexOf(' ') >= 0) {
            response.level = response.level.split(' ').join('-')
        }
        let image = `/images/${response.level}.jpg`
        console.log(image)
        $('#game-background').attr('src', image)
    }
})

socket.on('player-joined', addPlayer)
socket.on('player-left', removePlayer)

function identify() {
    $.post('/api/identify', {
        number: localStorage.number
    }).then(function (data) {
        socket.emit('identifier', localStorage.number)
    }).fail(function (data) {
        window.location.replace(data.responseText)
    })
}

identify()

$('#terminal').terminal(function (cmd) {
    let userCommand = cmd
    socket.emit('command', userCommand)
    gitBashed = this
}, {
    greetings: 'Git Bashed loaded...\r\nWelcome to Bootcamp Battle',
    prompt: '$ '
})

function incomingChat(data) {
    console.log(`User: ${data.user}`)
    console.log(`Message: ${data.message}`)
    let incomingMessage = `${data.message}`
    let incomingUserName = `${data.user}`
    let chatDiv = $('<div>')
    chatDiv.addClass('outgoing-message-container darker')
    let avatar = $('<img>')
    avatar.attr({
        'src': '/images/default-slack-2.png'
    }, {
        'alt': 'Avatar'
    })
    let playerName = $('<h6>')
    playerName.text(incomingUserName)
    let messageText = $('<p>')
    messageText.text(incomingMessage)
    chatDiv.append(avatar, playerName, messageText)
    $('#message-screen').append(chatDiv)
    scrollDown()
}

function sendMessage(message) {
    socket.emit('chat', message)
}

$('#chat-button').on('click', function (event) {
    event.preventDefault()
    let message = $('#chat-message-area').val()
    sendMessage(message)
    let chatDiv = $('<div>')
    chatDiv.addClass('outgoing-message-container lighter')
    let avatar = $('<img>')
    avatar.attr({
        'src': '/images/default-slack-1.png'
    }, {
        'alt': 'Avatar'
    })
    let messageText = $('<p>')
    messageText.text(message)
    chatDiv.append(avatar, messageText)
    $('#message-screen').append(chatDiv)
    $('#chat-message-area').val('')
    scrollDown()
})

$('#chat-message-area').on('keyup', function (event) {
    if (event.key !== 'Enter') return
    $('#chat-button').trigger('click')
    event.preventDefault()
})

function scrollDown() {
    $('#message-screen').animate({
        scrollTop: $('#message-screen').prop('scrollHeight')
    }, 500);
}

function addPlayer(data) {
    let userName = ' ' + data
    let localUsers = $('#direct-message-column')
    let activeUser = $('<li>')
    activeUser.addClass('nav-item')
    activeUser.attr('id', data)
    let userLink = $('<a>')
    userLink.addClass('nav-link')
    userLink.css('color', 'whitesmoke')
    let online = $('<i>')
    online.addClass('fa-sm fas fa-circle')
    userLink.append(online, userName)
    activeUser.append(userLink)
    localUsers.append(activeUser)
}

function removePlayer(data) {
    $(`#${data}`).remove()
}