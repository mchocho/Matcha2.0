function ready() {
	const ui = [
		document.getElementById('profile_pic'),
		document.getElementById('rating'),
		document.getElementById('thumbnails'),
		document.getElementById('view_count'),
		document.getElementById('username'),
		document.getElementById('gender_group'),
		document.getElementById('preference_group'),
		document.getElementById('bio'),
		document.getElementById('gmap')		
	];

	//fetch('https://jsonplaceholder.typicode.com/users/1')
	fetch('https://postman-echo.com/get?foo1=bar1&foo2=bar2', {/*mode: 'cors', */headers: new Headers({"Access-Control-Allow-Origin": '*'})})
	.then(response => response.json())
    .then(json => console.log(json))
}

document.addEventListener("DOMContentLoaded", ready);

