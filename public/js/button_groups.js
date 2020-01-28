function script() {
	const dob = document.getElementById('dob'),
		gender_btns = document.getElementById('gender_group').childNodes,
		preference_btns = document.getElementById('preference_group').childNodes;
	
	if ('flatpickr' in window && isNode(dob)) flatpickr(dob, {});

	function isNode(el) {
		return (el instanceof Element);
	}

	for (let i = 0, n = gender_btns.length; i < n; i++) {
		gender_btns[i].addEventListener('click', function(e) {
			if (document.getElementById('gender'))
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
			if (document.getElementById('preference'))
				document.getElementById('preference').setAttribute('value', e.target.textContent);
			preference_btns.forEach(function(value) {
				if (isNode(value) && value.classList.contains('option'))
					value.classList.remove('option');
			});
			e.target.classList.add('option');
		});
	}
}
document.addEventListener("DOMContentLoaded", script);