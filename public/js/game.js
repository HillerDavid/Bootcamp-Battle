let socket = io.connect()
socket.emit('identifier', localStorage.number)
socket.on('chat', incomingChat)

$('#terminal').terminal(function (cmd) {
    let userCommand = cmd
    socket.emit('command', userCommand)
    socket.once('command-response', (response) => {
        this.echo(response)
    })
}, {
    greetings: 'Basher loaded...\r\nWelcome to Bootcamp Battle',
    prompt: '$ '
})

function incomingChat(data) {
    console.log(`User: ${data.user}`)
    console.log(`Message: ${data.message}`)
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
    // .animate({
    //     scrollTop: $('#chat').prop("scrollHeight")
    // }, 500);
    $('#chat-message-area').val('')
    scrollChat()
})

function scrollChat() {
    let chatLength = $('#chat > .outgoing-message-container').length
    // console.log(chatLength)
    if (chatLength > 6) {
        $('#chat > .outgoing-message-container').first().remove()
    }
}
