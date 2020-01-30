function script() {
    const   profile_id = document.getElementById('profile_id').value,
    		profile_name = document.getElementById('username').textContent,
            connect_status = document.getElementById('connection_status'),
            connection_btn = document.getElementById('connection_btn'),
            block_btn = document.getElementById('blockuser_btn'),
            reportuser_btn = document.getElementById('reportuser_btn');
          
    connection_btn.addEventListener('click', function(e) {
        xhr('/profile/connect.' + parseInt(profile_id), 'POST', null, function(xhr) {
        	const res = JSON.parse(xhr.responseText);
			if (res.result === 'Success') {
				if (res.youLikeUser === 'true') {
					connection_btn.textContent = 'Disconnect';
					if (res.userLikesYou === 'true') {
						//Connected
						connection_status.textContent = 'You and ' + profile_name + ' are both connected';
					} else {
						//User doesn't like you, sorry
						connection_status.textContent = 'It seems like ' + profile_name + " hasn't liked you back, hang in there.";
					}
				} else {
					connection_btn.textContent = 'Connect';
					if (res.userLikesYou === 'true') {
						connection_status.textContent = profile_name + ' now likes you, like them back to get to know more about them.';
					} else {
						connection_status.textContent = 'You and ' + profile_name + ' are not connected';
					}
				}
			}
        });
    }, true);

    block_btn.addEventListener('click', function(e) {
    	xhr('/profile/block.' + parseInt(profile_id), 'POST', null, function(xhr) {
    		const res = JSON.parse(xhr.responseText);
    		if (res.result === 'Success') {
    			if (res.profileBlocked === 'true') {
    				connection_btn.classList.add('hide');
    			} else {
    				connection_btn.classList.remove('hide');
    			}
    		} else {

    		}
    	});
    });

    reportuser_btn.addEventListener('click', function(e) {
    	xhr('/profile/report.' + parseInt(profile_id), 'POST', null, function(xhr) {
    		const res = JSON.parse(xhr.responseText);
    	});
    });


}

document.addEventListener("DOMContentLoaded", script);