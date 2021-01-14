function script() {
    const   profile_id = document.getElementById('profile_id').value,
    		profile_name = document.getElementById('username').textContent,
            connect_status = document.getElementById('connection_status'),
            // connection_btn = document.getElementById('connection_btn'),
            block_btn = document.getElementById('blockuser_btn'),
			reportuser_btn = document.getElementById('reportuser_btn'),
			fameRating = document.getElementById('rating');
          
    // connection_btn.addEventListener('click', function(e) {
    //     xhr('/profile/connect.' + parseInt(profile_id), 'POST', null, function(xhr) {
		// 			const res = JSON.parse(xhr.responseText);
		// 			console.log("cxcxcxcxcxcxcx" + JSON.stringify(res));
		// 	if (res.result === 'Success') {
		// 		if (res.youLikeUser === 'true') {
		// 			connection_btn.textContent = 'Disconnect';
		// 			if (res.userLikesYou === 'true') {
		// 				//Connected
		// 				connection_status.textContent = 'You and ' + profile_name + ' are both connected';
		// 			} else {
		// 				//User doesn't like you, sorry
		// 				connection_status.textContent = 'It seems like ' + profile_name + " hasn't liked you back, hang in there.";
		// 			}
		// 		} else {
		// 			connection_btn.textContent = 'Connect';
		// 			if (res.userLikesYou === 'true') {
		// 				connection_status.textContent = profile_name + ' now likes you, like them back to get to know more about them.';
		// 			} else {
		// 				connection_status.textContent = 'You and ' + profile_name + ' are not connected';
		// 			}
		// 		}
		// 	} else if (res.result === 'Blocked') {
    //             alertify.success('You can\'t connect with a blocked user. Sorry.');
    //         } else if (res.result === 'No image client') {
    //             alertify.alert('To connect with users you need a profile picture');
    //         } else if (res.result === 'No image profile') {
    //             alertify.alert('You can\'t connect with a user who doesn\'t have a profile picture');
    //         }
		// 	if (!isNaN(res['userRating']))
		// 		fameRating.textContent = res['userRating'];
    //     });
    // }, true);

    block_btn.addEventListener('click', function(e) {
			console.log("KDKDKDKDKDK");
    	alertify.confirm("You are about to block " + profile_name + " from your preference list. Are you sure?", function() {
            xhr('/profile/block.' + parseInt(profile_id), 'POST', null, function(xhr) {
            const res = JSON.parse(xhr.responseText);
            if (res.result === 'Success') {
                if (res.profileBlocked === 'true') {
                    // connection_btn.classList.add('hide');
                    block_btn.classList.add('hide');
                    alertify.success('You have succefully blocked ' + profile_name + '.');
                }
            } else {
                alertify.error('Something went wrong. Please try again.');
            }
          });        
    	});
    });

    reportuser_btn.addEventListener('click', function(e) {
        alertify.confirm("You are about to report " + profile_name + ". There are other ways to settle disputes. Are you sure?", function() {
        	xhr('/profile/report.' + parseInt(profile_id), 'POST', null, function(xhr) {
        		const res = JSON.parse(xhr.responseText);

                if (res.result === 'Success') {
                    alertify.success(profile_name + ' \'s account has been reported.');
                } else {
                    alertify.error('Something went wrong. Please try again.');   
                }
        	});
        },
        function(){
            alertify.success('Maybe, you & ' + profile_name + ' should talk more.');
        })

    });


}

document.addEventListener("DOMContentLoaded", script);