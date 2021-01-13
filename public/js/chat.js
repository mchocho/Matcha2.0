console.log('frontend socket connected');

let messages = document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('m');
let username = document.getElementById('username');
let roomName = document.getElementById('roomName');

let socket = io();

socket.emit('joinRoom', {
	 username: username.innerText,
	 room: roomName.innerText
	}
);

form.addEventListener('submit', function(e) {
	e.preventDefault();
	if (input.value) {
		socket.emit('fromClient', input.value);
		input.value = ''; // may need to delete this
	}
});

socket.on('fromServer', (data) => {
	console.log("hey hey");
	let userDiv = document.createElement('span');
	userDiv.setAttribute("class", "username");
	userDiv.textContent = data.user;

	let msgDiv = document.createElement('span');
	msgDiv.setAttribute("class", "msgBody");
	msgDiv.textContent = data.msg;

	let item = document.createElement('li');
	item.append(userDiv, msgDiv);
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
});
