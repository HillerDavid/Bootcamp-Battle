let socket = io.connect()
let playerNames = []

$('#stats-tab').on('click', event => {
    socket.emit('stats', 'EXPLAAAIIIINNN TOOO MEEEE')
})

$('#inventory-tab').on('click', event => {
    // socket for inventory tab will be here.
    socket.emit('inventory', 'The voices where pretty gooood.')
})

socket.on('stats', displayStats)

function displayStats(data) {
    // console.log(data)
    $('#stats-player-name').text('Username: ' + data.player_name)
    $('#stats-level').text('Level: ' + data.level)
    $('#stats-experience').text('Exp: ' + data.exp)
    $('#stats-stress').text('Stress(HP) ' + data.hp + '/' + data.stressLimit + ' (Stress Limit)')
    $('#stats-mp').text('Endurance(MP): ' + data.mp)
    $('#stats-attack').text('Front End(Attack): ' + data.attack)
    $('#stats-defense').text('Back End(Defense): ' + data.defense)
    $('#stats-currency').text('Nerd Cred(Currency): ' + data.currency)
}

socket.on('inventory', displayInventory)

function displayInventory(data) {
    // console.log(data)
    $('#energy-drink-count').text(data.energyDrinks.quantity || 0)
    $('#sports-drink-count').text(data.sportsDrinks.quantity || 0)
    $('#coffee-count').text(data.coffees.quantity || 0)
    $('#mechanical-keyboard-count').text(data.mechanicalKeyboards.quantity || 0)
    $('#ssd-count').text(data.ssds.quantity || 0)
    $('#optical-mouse-count').text(data.opticalMice.quantity || 0)
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

let gitBashed = $('#terminal').terminal(function (cmd) {
    let userCommand = cmd
    socket.emit('command', userCommand)
}, {
    
    greetings: 'Git Bashed loaded...\r\nWelcome to Bootcamp Battle',
    prompt: '$ ',
    tabcompletion: true,
    doubletab: false,
    completion: function(command, callback) {
        let commands = ['accept', 'attack', 'buy', 'cast', 'challenge', 'clear', 'equip', 'move', 'sleep', 'unequip', 'use']
        let items = ['energy drink', 'sports drink', 'coffee', 'console.log', 'mechanical keyboard', 'solid-state drive', 'optical mouse']
        let spells = ['bootstrap', 'do nothing', 'for loop', 'jquery', 'mysql', 'sequelize']
        let rooms = ['class', 'home', 'panera', 'vending machine']
        let beginning = gitBashed.get_command()
        let possibilities
        if (beginning === command) {
            possibilities = findPossibilities(commands, beginning)
        } else {
            beginning = beginning.toLowerCase()
            let tempCommand = beginning.split(' ')[0]
            let tempModifier = beginning.split(' ').slice(1).join(' ')
            switch (tempCommand) {
            case 'accept':
            case 'challenge':
                possibilities = findPossibilities(playerNames, tempModifier)
                break
            case 'buy':
            case 'equip':
            case 'unequip':
            case 'use':
                possibilities = findPossibilities(items, tempModifier)
                break
            case 'cast':
                possibilities = findPossibilities(spells, tempModifier)
                break
            case 'move':
                possibilities = findPossibilities(rooms, tempModifier)
                break

            }
        }

        if (possibilities.length < 1 || possibilities.length > 1) {
            return
        }
        gitBashed.insert(possibilities[0].slice(command.length))
    }
})

function findPossibilities(array, beginning) {
    return array.filter(word => {
        for(let i = 0; i < beginning.length; i++) {
            if (word[i] !== beginning[i]) {
                return false
            }
        }
        return true
    })
}

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
    playerNames.push(data.toLowerCase())
    console.log(playerNames)
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
    playerNames = playerNames.filter(name => (data.toLowerCase() !== name))
    console.log(playerNames)
    $(`#${data}`).remove()
}