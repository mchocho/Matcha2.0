function script() {
	const dob 				= document.getElementById('dob');
	const gender_btns 		= document.getElementById('gender_group').childNodes;
	const preference_btns 	= document.getElementById('preference_group').childNodes;
	const formIds 			= ['username', 'f_name', 'l_name', 'gender', 'preference', 'dob', 'email'];

	flatpickr(dob, {});

	//Save form state to memory
	document.getElementById('signup')
	.addEventListener('change', () =>
	{
		if (storageAvailable('sessionStorage'))
			formIds.forEach(id =>
			{
				sessionStorage.setItem(id, document.getElementById(id).value);
			});
	});

	//Add listeners to radio btns
	[...gender_btns].forEach((btn, i, arr) =>
	{
		btn.addEventListener('click', e =>
		{
			const node 		= document.getElementById('gender');
			const target 	= e.currentTarget;

			node.setAttribute('value', target.textContent);

			arr.forEach(el =>
			{
				el.classList.remove('option');
			});
			target.classList.add('option');
		});
	});

	//Add listeners to radio btns
	[...preference_btns].forEach((btn, i, arr) =>
	{
		btn.addEventListener('click', e =>
		{
			const node 		= document.getElementById('preference');
			const target 	= e.currentTarget;

			node.setAttribute('value', target.textContent);
			
			arr.forEach(el =>
			{
				el.classList.remove('option');
			});
			target.classList.add('option');
		});
	})

	//Reset form input values
	formIds.forEach(value =>
	{
		if (storageAvailable('sessionStorage')) {
			const item = sessionStorage.getItem(value);

			if (!item)
				return;

			if (item.length > 0)
			{
				if (value === 'gender')
				{
					if (item === 'Female')
						gender_btns[0].classList.add('option');
					else
						gender_btns[1].classList.add('option');
				}
				else if (value === 'preference')
				{
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

	function storageAvailable(type)
	{
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
}
document.addEventListener("DOMContentLoaded", script);
