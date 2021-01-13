window.onload=function(){
	const connection_btnn = document.getElementById('connection_btnn');
	const profile_id = document.getElementById('profile_id').value;
	const fameRating = document.getElementById('rating');
	const connect_status = document.getElementById('connection_status');
	const profile_name = document.getElementById('username').textContent;
	const chatButton = document.getElementById('chat_btn');
	const connImg = document.getElementById('conn_img');
	const roomId = document.getElementById('room_id');
	let room_id = roomId.value;

	connection_btnn.addEventListener('click', function(e) {
		let xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				res = JSON.parse(this.responseText);
				console.log("AJAX side " + this.responseText);
				
				if (!res.roomId) {
					roomId.setAttribute("value", "");
					room_id = "";
				}

				if (!res.youLikeUser || !res.otherUserLikesYou) {
					connImg.setAttribute("class", "d-none");
					chatButton.setAttribute("class", "nu d-none");
				}

				if (res.success === true) {
					if (res.youLikeUser === true) {
						connection_btnn.textContent = 'Disconnect';
						if (res.otherUserLikesYou === true) {
							connect_status.textContent = 'You and ' + profile_name + ' are both connected';
							chatButton.setAttribute("class", "nu btn-dark ml-1 d-inline");
							connImg.setAttribute("class", "d-inline");
							if (res.roomId) {
								roomId.setAttribute("value", res.roomId);
								room_id = res.roomId;
								chatButton.href = "/chat?roomId=" + room_id + "&otherUserId=" + profile_id;
							}
						} else {
							connect_status.textContent = 'It seems like ' + profile_name + " hasn't liked you back, hang in there.";
						}
					} else {
						connection_btnn.textContent = 'Connect';
						connect_status.textContent = 'You and ' + profile_name + ' are not connected';
					}
					if (!isNaN(res.rating)) {
						fameRating.textContent = res.rating;
					}
				} else {
					if (res.otherUserBlockedYou) {
						alertify.success("You can't connect with a blocked user that has blocked you. Sorry.");
					} else if (!res.userHasImage) {
						alertify.alert('To connect with users you need a profile picture');
					} else if (!res.otherUserHasImage) {
						alertify.alert('You can\'t connect with a user who doesn\'t have a profile picture.');
					}
				}
			}
		}
		xhttp.open("POST", "/profile/cconnect", true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send("otherUser=" + profile_id);
		e.preventDefault();
	});
}