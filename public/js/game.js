let socket = io.connect()
socket.on('chat', newMessage)

function newMessage(data) {
    console.log(data.user, data.message)
}