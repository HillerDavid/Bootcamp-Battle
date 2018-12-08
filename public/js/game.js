let socket = io.connect();

$('#terminal-button').on('click', function(event){
    event.preventDefault()
    console.log('I was clicked.')
    let userCommand = $('#terminal-cmd').val()
    $('#terminal-cmd').val('')
    playerAction(userCommand)
})

playerAction = (command) => {
    let message = ('<p style="color: lime;">').text(command)
    $('#terminal-prompts').append(message)
    enemyAction()
}

enemyAction = () => {
    let message = ('<p style="color: red;">').text('There is definitely a spoon.')
    $('#terminal-prompts').append(message)
}