function script() {
	// $('.slider').bxSlider();
	const DEVMODE = true;

	const inputFields = [
		document.getElementById('username_txt'),
		document.getElementById('first_name_txt'),
		document.getElementById('last_name_txt')

	];

	function isNode(el) {
        	return (el instanceof Element);
    	}

    	function isValidStr(val) {
    		return (Object.prototype.toString.call(val) !== "[object String]"
    			&& val.length > 0 && /^[a-zA-Z]+$/.test(val))
    	}

	function editActions(edit_btn, edit_container, confirm_btn, cancel_btn, validation) {
		edit_btn.addEventListener('click', function() {
			edit_btn.classList.add('hide');
			edit_container.classList.remove('hide');
			return;
		}, true);

		confirm_btn.addEventListener('click', function() {
			if (validation) {
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

	//Enable edit
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
		validateUsername
	);

	editActions(
		document.getElementById('interests_add_btn'),
		document.getElementById('interest_edit_container'),
		document.getElementById('interests_confirm'),
		document.getElementById('interests_cancel')
	);

	//Validation methods
	function validateUsername() {
		const value = inputFields[0].value,
		      error_node = document.getElementById('error_0');

		if (value.length > 3 && !isValidStr(value)) {
			error_node.textContent = "Please enter a valid username";
			return false;
		}
		error_node.textContent = "";
		return true;
	}

	function validateFullname() {
		const firstname = inputFields[1].value,
		      lastname = inputField[2].value,
		      error_node = document.getElementById('error_1');

		if (firstname.length === 0 || !isValidStr(firstname) {
			error_node.textContent = "Please enter a first name";
			return false;
		}
		if (lastname.length === 0 || !isValidStr(lastname)) {
			error_node.textContent = 'Please enter a last name';
			return false;
		}
		return true;
	}

	function validateInterests() {
		const value = 
	}
	



	//Send requests on confirmation click or button change
	document.getElementById('username_confirm').addEventListener('click', function() {
		const value = inputFields[0].value;

		if (value.length > 0) {
			if (DEVMODE)
				console.log('Updating username');
			xhr('/user/username.' + value, 'POST');
		}
	});

	document.getElementById('fullname_confirm').addEventListener('click', function() {
		const firstname = inputFields[1].value;
		const lastname = inputField[2].value;

		if (firstname.length < 1) {
			
		}
	});


	//TEST
	// let pair = 'email.HappyDay'

	// setTimeout(function() {
	// 	xhr('/user/' + pair, 'POST');
	// }, 8000);

	//ENDOF TEST
}

document.addEventListener("DOMContentLoaded", script);
