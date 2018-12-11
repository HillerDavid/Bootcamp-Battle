let socket = io.connect();
socket.emit('identifier', localStorage.number)

$('#terminal-button').on('click', function (event) {
    event.preventDefault()
    // console.log('I was clicked.')
    let userCommand = $('#terminal-cmd').val()
    socket.emit('command', userCommand)
    $('#terminal-cmd').val('')
})


$('#terminal').terminal(function (command) {
    if (command !== '') {
        var result = window.eval(command);
        if (result != undefined) {
            this.echo(String(result));
        }
    }
})