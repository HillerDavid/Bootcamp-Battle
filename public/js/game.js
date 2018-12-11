let socket = io.connect();
socket.emit('identifier', localStorage.number)

$('#terminal-button').on('click', function (event) {
    event.preventDefault()
    // console.log('I was clicked.')
    let userCommand = $('#terminal-cmd').val()
    socket.emit('command', userCommand)
    $('#terminal-cmd').val('')
})

$('#chat-button').on('click', function (event) {
    event.preventDefault()
    let message = $('#chat-message-area').val()
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
    $("#chat").append(chatDiv)
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