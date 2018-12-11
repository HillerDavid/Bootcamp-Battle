let socket = io.connect()
socket.emit('identifier', localStorage.number)

$('#terminal').terminal(function (cmd, term) {
    let userCommand = cmd
    socket.emit('command', userCommand)
    socket.on('', (response) => {
        term.echo(response)
    })
}, {
    greetings: 'Welcome to Bootcamp Battle',
    prompt: '$ '
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
