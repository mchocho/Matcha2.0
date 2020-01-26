function script() {
	// $('.slider').bxSlider();
	const DEVMODE = true,
	interests = document.getElementById('interests_list').childNodes,
	inputFields = [
		document.getElementById('username_txt'),			//0
		document.getElementById('firstname_txt'),			//1
		document.getElementById('lastname_txt'),			//2
		document.getElementById('gender_female_btn'),			//3
		document.getElementById('gender_male_btn'),			//4
		document.getElementById('preference_female_btn'),		//5
		document.getElementById('preference_male_btn'),			//6
		document.getElementById('preference_both_btn'),			//7
		document.getElementById('preference_both_btn'),			//8
		document.getElementById('interest_txt'),			//9
		document.getElementById('biography_txt'),			//10
		document.getElementById('old_password_txt'),			//11
		document.getElementById('new_password_txt'),			//12
		document.getElementById('confirm_password_txt'),			//13
	];

	function isNode(el) {
       	return (el instanceof Element);
    }

	function isValidStr(val) {
		return (Object.prototype.toString.call(val) === "[object String]"
			&& val.length > 0 && /^[a-zA-Z]+$/.test(val))
	}

	function editActions(edit_btn, edit_container, confirm_btn, cancel_btn, validation) {
		edit_btn.addEventListener('click', function() {
			edit_btn.classList.add('hide');
			edit_container.classList.remove('hide');
			return;
		}, true);

		confirm_btn.addEventListener('click', function() {
			if (validation()) {
				edit_container.classList.add('hide');
				edit_btn.classList.remove('hide');
			}
			return;
		}, true);

		cancel_btn.addEventListener('click', function() {
			edit_container.classList.add('hide');
			edit_btn.classList.remove('hide');
			return;
		}, true);
	}

	//Validation methods
	function validateUsername() {
		const value =  inputFields[0].value.trim(),
		      error_node = document.getElementById('error_0');

		if (value.length < 3 && !isValidStr(value)) {
			error_node.textContent = "Please enter a valid username";
			return false;
		}
		error_node.textContent = "";
		xhr('/user/username.' + value, 'POST', null, function(xhr) {
			const res = JSON.parse(xhr.responseText);
			if (res.result === 'Success') {
				document.getElementById('username').textContent = xhr.value;
			} else {
				error_node.textContent = "Please try again.";
			}
		});
		return true;
	}

	function validateFullname() {
		const firstname = inputFields[1].value.trim(),
		      lastname = inputFields[2].value.trim(),
		      error_node = document.getElementById('error_1');

		if (firstname.length === 0 || !isValidStr(firstname)) {
			error_node.textContent = "Please enter a first name";
			return false;
		}
		if (lastname.length === 0 || !isValidStr(lastname)) {
			error_node.textContent = 'Please enter a last name';
			return false;
		}
		if (firstname.indexOf('|') > -1 || lastname.indexOf('|') > -1)
		{
			error_node.textContent = 'No pipe characters allowed';
			return false;
		}
		error_node.textContent = "";
		xhr('/user/fullname.' + firstname + '.' + lastname, 'POST', null, function(xhr) {
			//Handle the request
		});
		return true;
	}

	function validatePassword() {
		const oldpw = inputFields[11].value.trim(),
			  newpw = inputFields[12].value.trim(),
			  confirmpw = inputFields[13].value.trim(),
			  error_node = document.getElementById('error_4');

		if (oldpw.length === 0) {
			error_node.textContent = "Please enter your password";
			return false;
		} else if (newpw.length === 0) {
			error_node.textContent = "Please enter a new password";
			return false;
		} else if (confirmpw.length === 0) {
			error_node.textContent = "Please confirm your new password";
			return false;
		} else if (newpw !== confirmpw) {
			error_node.textContent = "The passwords you provided don't match";
			return false;
		} else if (oldpw === confirmpw) {
			error_node.textContent = "Can't use current password";
			return false;
		}
		error_node.textContent = "";
		xhr('/user/resetpassword.' + oldpw + '.' + confirmpw, 'POST', null, function(xhr) {
			const res = JSON.parse(xhr.responseText),
				  el = document.getElementById('username');
			if (res.result === 'Success') {
				el.textContent = "Password change successful";
				setTimeout(8000, function() {
					el.textContent = "";
				});
			} else if (res.result === 'Weak password') {
				el.textContent = "Please provide a 5 letter password that contains lower and upper cases, as well as numbers";
			} else {

			}
		});
		return true;
	}

	function validateInterests() {
		const value = inputFields[9].value.trim(),
		      error_node = document.getElementById('error_5');

		if (value.length <= 2) {
			error_node.textContent = 'Please enter an interest';
			return false;
		}
		error_node.textContent = "";
		xhr('/user/interest.' + value, 'POST', null, function(xhr) {
			const res = JSON.parse(xhr.responseText),
				  el = document.getElementById('interests_list'),
				  li = document.createElement('li');
			if (res.result === 'Success') {
				li.textContent = value;
				el.appendChild(li);		
			} else {
				el.textContent = 'Please try again.';
			}
		});
		return true;
	}

	function validateBio() {
		const value = inputFields[10].value.trim(),
		      error_node = document.getElementById('error_6');

		if (value.length == 0) {
			error_node.textContent = 'Please enter your biography';
			return false;
		}
		error_node.textContent = "";
		xhr('/user/interest.' + value, 'POST', null, function(xhr) {
			const res = JSON.parse(xhr.responseText);
		});
		return true;
	}

	//Enable text input editing
	editActions(
		document.getElementById('username_edit_btn'),
		document.getElementById('username_edit_container'),
		document.getElementById('username_confirm'),
		document.getElementById('username_cancel'),
		validateUsername
	);

	editActions(
		document.getElementById('fullname_edit_btn'),
		document.getElementById('fullname_edit_container'),
		document.getElementById('fullname_confirm'),
		document.getElementById('fullname_cancel'),
		validateFullname
	);

	editActions(
		document.getElementById('password_edit_btn'),
		document.getElementById('password_edit_container'),
		document.getElementById('password_confirm'),
		document.getElementById('password_cancel'),
		validatePassword
	);

	editActions(
		document.getElementById('interests_add_btn'),
		document.getElementById('interest_edit_container'),
		document.getElementById('interests_confirm'),
		document.getElementById('interests_cancel'),
		validateInterests
	);

	editActions(
		document.getElementById('biography_edit_btn'),
		document.getElementById('biography_edit_container'),
		document.getElementById('biography_confirm'),
		document.getElementById('biography_cancel'),
		validateBio
	);

	function updateGender(node) {
		node.addEventListener('click', function(e) {
			const value = (node.id === 'gender_female_btn') ? 'F' : 'M',
				error_node = document.getElementById('error_2');
			
			xhr('/user/gender.' + value, 'POST', null, function(xhr) {
					const res = JSON.parse(xhr.responseText);
					if (res.result !== 'Success')
						error_node.textContent = 'Gender change request failed. Please try again.';
			});
		});
	}

	function updatePreference(node) {
		node.addEventListener('click', function(e) {
			const error_node = document.getElementById('error_3');
			let value;
			if (node.id === 'preference_female_btn')
				value = 'F';
			else if (node.id === 'preference_male_btn')
				value = 'M'
			else if (node.id === 'preference_both_btn')
				value = 'B';
			else return; 

			xhr('/user/preferences.' + value, 'POST', null, function(xhr) {
				const res = JSON.parse(xhr.responseText);
				if (res.result !== 'Success')
					error_node.textContent = 'Preference change request failed. Please try again.';
			});
		});
	}

	function rmPreferenceEvent(node) {
		if (!isNode(node)) return;
		node.addEventListener('click', function(e) {
			xhr('/user/rm_interest.' + node.id, 'POST', null, function(xhr) {
				const res = JSON.parse(xhr.responseText);
				if (res.result === 'Success') {
					document.getElementById('interests_list').removeChild(node);
				}
			});
		});
	}

	updateGender(inputFields[3]);
	updateGender(inputFields[4]);
	updatePreference(inputFields[5]);
	updatePreference(inputFields[6]);
	updatePreference(inputFields[7]);

	interests.forEach(function(res) {
		rmPreferenceEvent(res);
	});




}

document.addEventListener("DOMContentLoaded", script);
