$(function() {
	// var socket = io('http://localhost:3000');
	var chatID =
		'/' +
		window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
	const socket = io(chatID);

	var $messageForm = $('#sendMessage');
	var $messageBox = $('#m');
	var $chat = $('#messages');

	var $nickForm = $('#setNick');
	var $nickError = $('#nickError');
	var $nickBox = $('#nickname');
	var $users = $('#users');

	// $nickForm.submit(function (e) {
	// 	e.preventDefault(); // prevents page reloading
	// 	socket.emit('new user', $nickBox.val(), function (data) {
	// 		// function data is true or false, false is name exists
	// 		// true if name it unique and added to socket / chat
	// 		// refer to index.js socket.on('new user')...
	// 		if (data) { //so if true
	// 			$('#nickWrap').hide();
	// 			$('#content').show();
	// 		} else {
	// 			$nickError.html('Username exists. Please try again.');
	// 		}
	// 	});
	// 	$nickBox.val('');
	// });

	// List all users in chatroom
	// socket.on('usernames', function (data) {
	// 	var html = '';
	// 	for (i = 0; i < data.length; i++) {
	// 		// $users.append($('<li class="list-group-item">').text(data[i]));
	// 		html += data[i] + '<br/>';
	// 	}
	// 	$users.html(html);
	// });

	$messageForm.submit(function(e) {
		e.preventDefault(); // prevents page reloading
		socket.emit('chat message', $messageBox.val(), function(data) {
			$chat.append('<li class="list-group-item error">' + data);
		});
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function(msg) {
		$chat.append(
			'<li class="list-group-item">' +
				'<span><b>' +
				msg.nick +
				': </b></span>' +
				msg.msg
		);
		// $chat.append($('<li class="list-group-item">').text(msg));
	});

	socket.on('whisper', function(msg) {
		$chat.append(
			'<li class="whisper list-group-item">' +
				'<span><b>' +
				msg.nick +
				': </b></span>' +
				msg.msg
		);
	});
});
