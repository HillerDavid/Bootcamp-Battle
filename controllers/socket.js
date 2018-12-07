module.exports = function(io) {
    io.on('connection', newConnection)

    function newConnection(socket) {
        console.log(`New connection: ${socket.id}.`)
        socket.on('chat', newMessage)
        socket.on('command', executeCommand)

        function executeCommand(data) {
            let command = data.split(' ')[0]
            let modifier = data.split(' ')[1]
            
        }

        function newMessage(data) {
            io.emit('chat', data)
        }
    }

}