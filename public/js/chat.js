var socket = io();
console.log('front side socket connected');

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('m');
var username = document.getElementById('username');

socket.emit('add user', username.innerText);

form.addEventListener('submit', function(e) {
	e.preventDefault();
	if (input.value) {
		socket.emit('chat message', input.value, username.innerText);
		input.value = '';
	}
});

socket.on('chat message', (data) => {
	console.log("hey hey");
	var userDiv = document.createElement('span');
	userDiv.setAttribute("class", "username");
	userDiv.textContent = data.user;

	var msgDiv = document.createElement('span');
	msgDiv.setAttribute("class", "msgBody");
	msgDiv.textContent = data.msg;

	var item = document.createElement('li');
	item.append(userDiv, msgDiv);
	messages.appendChild(item);
	window.scrollTo(0, document.body.scrollHeight);
});
