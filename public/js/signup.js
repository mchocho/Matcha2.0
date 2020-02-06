function script() {
	const dob = document.getElementById('dob'),
		gender_btns = document.getElementById('gender_group').childNodes,
		preference_btns = document.getElementById('preference_group').childNodes,
		storage = storageAvailable('session'),
		formIds = ['username', 'f_name', 'l_name', 'gender', 'preference', 'dob', 'email'];
	if ('flatpickr' in Window)
		flatpickr(dob, {});
	function isNode(el) {
		return (el instanceof Element);
	}
	function storageAvailable(type) {
	    var storage;
	    try {
	        storage = window[type];
	        var x = 'N032195';
	        storage.setItem(x, x);
	        storage.removeItem(x);
	        return true;
	    }
	    catch(e) {
	        return e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') && (storage && storage.length !== 0);
	    }
	}

	for (let i = 0, n = gender_btns.length; i < n; i++) {
		gender_btns[i].addEventListener('click', function(e) {
			document.getElementById('gender').setAttribute('value', e.target.textContent);
			gender_btns.forEach(function(value){
				if (isNode(value) && value.classList.contains('option'))
					value.classList.remove('option');
			});
			e.target.classList.add('option');
		});
	}
	for (let i = 0, n = preference_btns.length; i < n; i++) {
		preference_btns[i].addEventListener('click', function(e) {
			document.getElementById('preference').setAttribute('value', e.target.textContent);
			preference_btns.forEach(function(value) {
				if (isNode(value) && value.classList.contains('option'))
					value.classList.remove('option');
			});
			e.target.classList.add('option');
		});
	}

	document.getElementById('signup').addEventListener('change', function() {
		formIds.forEach(function(value) {
			if (storageAvailable('sessionStorage'))
				sessionStorage.setItem(value, document.getElementById(value).value);
		});
	});

	formIds.forEach(function(value) {
		if (storageAvailable('sessionStorage')) {
			const item = sessionStorage.getItem(value).trim();
			if (item.length > 0) {
				if (value === 'gender') {
					if (item === 'Female')
						gender_btns[0].classList.add('option');
					else
						gender_btns[1].classList.add('option');
				} else if (value === 'preference') {
					if (item === 'Female')
						preference_btns[0].classList.add('option');
					else if (item === 'Male')
						preference_btns[1].classList.add('option');
					else
						preference_btns[2].classList.add('option');
				}
				document.getElementById(value).value = sessionStorage.getItem(value);
			}
		}
	});
}
document.addEventListener("DOMContentLoaded", script);
