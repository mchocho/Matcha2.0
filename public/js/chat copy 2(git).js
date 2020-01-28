$(function () {

	// Initialise all the variables
	var $window = $(window);
	var $usernameInput = $('#usernameInput'); // Input for username
	var $messages = $('#messages'); // Messages 'list'
	var $inputMessage = $('#m'); // Input box for new messages

	var $loginPage = $('#username'); // The login page
	var $chatPage = $('#chat'); // The chatroom page

	// prompt for setting username
	var username;
	var connected = false;
	var typing = false; //not using this feature now
	var lastTypingTime; // not using currently
	var $currentInput = $usernameInput.focus(); // what does this do??
	// var $usernameForm = $('#usernameForm');

	var socket = io(); // create the server

	const addParticipantMessage = (data) => {
		var message = '';
		if (data.numUsers === 1) {
			message += "there's 1 participant";
		} else {
			message += "there are " + data.numUsers + " participants";
		}
		log(message);
	}

	// $usernameForm.submit(setUsername());

	const setUsername = () => {
		username = cleanInput($usernameInput.val().trim());
		console.log(username);

		// If the username is valid
		if (username) {
			$usernameBtn.click()
			$loginPage.fadeOut();
			$chatPage.show();
			$loginPage.off('click');
			$currentInput = $inputMessage.focus();

			// Tell the server you username
			socket.emit('add user', username);
		}
	}

	// Sends chat message
	const sendMessage = () => {
		var message = $inputMessage.val();

		//Prevent markup from being injected into the message
		message = cleanInput(message);

		// if there is a non-empty message and a socket connection
		if (message && connected) {
			$inputMessage.val('');
			addChatMessage({
				username: username,
				message: message
			});

			// tell server to execute 'chat message' and send along one parameter
			socket.emit('chat message', message);
		}
	}

	// Log a message
	const log = (message, options) => {
		var $el = $('<li class="list-group-item">').addClass('log').text(message);
		addMessageElement($el, options);
	}

	// Adds visual chat message to the message list
	const addChatMessage = (data, options) => {
		options = options || {};

		// Div for username displayed
		var $usernameDiv = $('<span class="username"/>')
			.text(data.username);

		// message body display
		var $messageBodyDiv = $('<span class="messageBody">')
			.text(data.message);

		var $messageDiv = $('<li class="message"/>')
			.data('username', data.username)
			.append($usernameDiv, $messageBodyDiv);

		addMessageElement($messageDiv, options);
	}

	// Adds a message element to the messages and scrolls to the bottom
	// el - The element to add as a message
	// options.fade - If the element should fade-in (default = true)
	// options.prepend - If the element should prepend
	//   all other messages (default = false)
	const addMessageElement = (el, options) => {
		var $el = $(el);

		// Setup default options
		if (!options) {
			options = {};
		}

		// Apply options
		if (options.prepend) {
			$messages.prepend($el);
		} else {
			$messages.append($el);
		}
		$messages[0].scrollTop = $messages[0].scrollHeight;
	}

	//Prevents input from having injected markup
	const cleanInput = (input) => {
		return $('<div/>').text(input).html();
	}


	// KEYBOARD EVENTS
	$window.keydown(event => {

		// Auto-focus the current input when a key is typed
		if (!(event.ctrlKey || event.metaKey || event.altKey)) {
			$currentInput.focus();
		}

		// When the client hits ENTER on their keyboard
		if (event.which === 13) {
			if (username) {
				sendMessage();
				typing = false;
			} else {
				setUsername();
			}
		}
	});

	// the ? is typing feature
	//   $inputMessage.on('input', () => {
	// 	updateTyping();
	//   });


	// CLICK EVENTS

	// Focus input when clicking anywhere on login page
	$loginPage.click(() => {
		$currentInput.focus();
	});

	// Focus input when clicking message inputs border
	$inputMessage.click(() => {
		$inputMessage.focus();
	});


	// SOCKET EVENTS

	// Whenever the server emits 'login', log the login message
	socket.on('login', (data) => {
		connected = true;

		// Display the welcome message
		var message = "Welcome to Matcha Chat";
		log(message, {
			prepend: true
		});
		addParticipantMessage(data);
	})

	// Whenever the server emits 'chat message', update the chat body
	socket.on('chat message', (data) => {
		addChatMessage(data);
	});

	// Whenever the server emits 'user joined', update the chat body
	socket.on('user joined', (data) => {
		log(data.username + 'joined');
		addParticipantMessage(data);
	});

	// Whenever the server emits 'user left', update the chat body
	socket.on('user left', (data) => {
		log(data.username + 'left');
		addParticipantMessage(data);
	});

	socket.on('disconnect', () => {
		log('You have been disconnected');
	});

	socket.on('reconnect', () => {
		log('You have been reconnected');
		if (username) {
			socket.emit('add user', username);
		}
	});

	socket.on('reconnect_error', () => {
		log('Reconnect attempt has failed');
	});



})
