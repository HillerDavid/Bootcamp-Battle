let socket = io.connect();

$('#my_form').onkeyup(function () {
    var key = e.which;
    if (key == 13) {
        // As ASCII code for ENTER key is "13"
        console.log('Hello'); // Submit form code
    }
});