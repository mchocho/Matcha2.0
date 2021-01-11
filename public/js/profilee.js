window.onload=function(){
	const connection_btnn = document.getElementById('connection_btnn');
	const   profile_id = document.getElementById('profile_id').value

	connection_btnn.addEventListener('click', function(e) {
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log("AJAX side" + this.responseText); 
			}
		}
		xhttp.open("POST", "/profile/cconnect", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send("otherUser=" + profile_id);
		e.preventDefault();
	});
}