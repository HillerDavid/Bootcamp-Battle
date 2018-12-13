let socket = io.connect()
let basher

socket.on('chat', incomingChat)
socket.on('command-response', (response) => {
    basher.echo(response.message)
    if (response.level) {
        let image = `/images/${response.level}.jpg`
        console.log(image)
        $('#game-background').attr('src', image)
    }
})


$.post('/api/identify', {
    number: localStorage.number
}).then(function () {
    socket.emit('identifier', localStorage.number)
})

$('#terminal').terminal(function (cmd) {
    let userCommand = cmd
    socket.emit('command', userCommand)
    basher = this
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
    $('#message-screen').animate({scrollTop: $('#message-screen').prop("scrollHeight")}, 500);
}

// Testing object for displayActiveUsers function, holding each active user in a certain room.
var activeUserObject = {
    panera: ['Michael', 'Ben', 'David', 'Will'],
    class: ['Ben', 'David']
}

function displayActiveUsers() {
    // Empty array or object should be defined that will populate and update as users enter and leave and area
    // Everytime a user enters or leaves a specific area, this function should be called which displays all active users in the object/array
    activeUserObject.class.forEach(function (elem) {
        // console.log(elem)
        let userName = ' ' + elem
        let localUsers = $('#direct-message-column')
        let activeUser = $('<li>')
        activeUser.addClass('nav-item')
        let userLink = $('<a>')
        userLink.addClass('nav-link')
        userLink.css("color", "whitesmoke")
        let online = $('<i>')
        online.addClass('fa-sm fas fa-circle')
        userLink.append(online, userName)
        activeUser.append(userLink)
        localUsers.append(activeUser)
    })
}

// This function works if you un-comment the userName in the function and call it.
displayActiveUsers()