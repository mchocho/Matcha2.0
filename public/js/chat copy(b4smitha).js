$(function () {

	var socket = io('http://localhost:3000');

	$('form').submit(function (e) {
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', $('#m').val());
		console.log($('#m').val());
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function (msg) {
		$('#messages').append($('<li class="list-group-item">').text(msg));
	});

});
