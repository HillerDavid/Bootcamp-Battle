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
