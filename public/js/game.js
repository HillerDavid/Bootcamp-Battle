let socket = io.connect()
socket.emit('identifier', localStorage.number)
socket.on('chat', incomingChat)

$('#terminal').terminal(function (cmd) {
    let userCommand = cmd
    socket.emit('command', userCommand)
    socket.once('command-response', (response) => {
        this.echo(response.message)
        let image = `/images/${response.level}.jpg`
        console.log(image)
        $('#game-background').attr('src', image)
    })
}, {
    greetings: 'Basher loaded...\r\nWelcome to Bootcamp Battle',
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
    $('#chat').append(chatDiv)
    scrollChat()
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
    $('#chat').append(chatDiv)
    $('#chat-message-area').val('')
    scrollChat()
})

$('#chat-message-area').on('keyup', function (event) {
    if (event.key !== 'Enter') return
    $('#chat-button').trigger('click')
    event.preventDefault()
})

function scrollChat() {
    let chatLength = $('#chat > .outgoing-message-container').length
    // console.log(chatLength)
    if (chatLength > 6) {
        $('#chat > .outgoing-message-container').first().remove()
    }
}
