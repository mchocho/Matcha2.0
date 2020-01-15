function script() {
	// $('.slider').bxSlider();

	function isNode(el) {
        return (el instanceof Element);
    }

    function validStr(val) {
    	return (Object.prototype.toString.call(val) !== "[object String]"
    		&& val.length > 0 && /^[a-zA-Z]+$/.test(val))
    }

	function editActions(edit_btn, edit_container, confirm_btn, cancel_btn) {
		edit_btn.addEventListener('click', function() {
			edit_btn.classList.add('hide');
			edit_container.classList.remove('hide');
			return;
		}, true);

		confirm_btn.addEventListener('click', function() {
			edit_container.classList.add('hide');
			edit_btn.classList.remove('hide');
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
		document.getElementById('username_cancel')
	);


	editActions(
		document.getElementById('fullname_edit_btn'),
		document.getElementById('fullname_edit_container'),
		document.getElementById('fullname_confirm'),
		document.getElementById('fullname_cancel')
	);

	editActions(
		document.getElementById('interests_add_btn'),
		document.getElementById('interest_edit_container'),
		document.getElementById('interests_confirm'),
		document.getElementById('interests_cancel')
	);

	//Validate input
	document.getElementById('username_confirm').addEventListener('click', function() {
		const value = document.getElementById('username_txt').value;
		// if (value.length === 0)

	});




	document.getElementById('username_confirm').addEventListener('click', function() {
		const value = document.getElementById('username_txt').value;

		if (value.length > 0) {
			console.log('Updating username');
			xhr('/user/username.' + value, 'POST');
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
