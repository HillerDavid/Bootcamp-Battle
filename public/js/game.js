let socket = io.connect();
socket.emit('identifier', localStorage.number)

$('#terminal').terminal((command, term) => {
    console.log(command)
    let userCommand = command
    socket.emit('command', userCommand)
})