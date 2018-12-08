let socket = io.connect();
socket.emit('identifier', localStorage.number)

$('#terminal-button').on('click', function(event){
    event.preventDefault()
    // console.log('I was clicked.')
    let userCommand = $('#terminal-cmd').val()
    socket.emit('command', userCommand)
    $('#terminal-cmd').val('')
})