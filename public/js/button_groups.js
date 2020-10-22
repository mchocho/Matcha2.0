function script() {
	const dob 				= document.getElementById('dob');
	const gender_btns 		= document.getElementById('gender_group').childNodes;
	const preference_btns 	= document.getElementById('preference_group').childNodes;
	
	if ('flatpickr' in window) flatpickr(dob, {});

	[...gender_btns].forEach((btn, i, arr) =>
	{
		btn.addEventListener('click', e =>
		{
			const node 		= document.getElementById('gender');
			const target 	= e.currenTarget;

			if (node)
				node.setAttribute('value', target.textContent);
			arr.forEach(value =>
			{
				value.classList.remove('option');
			});
			target.classList.add('option');
		});
	});

	[...preference_btns].forEach((btn, i, arr) =>
	{
		btn.addEventListener('click', e =>
		{
			const node 		= document.getElementById('preference');
			const target 	= e.currentTarget;

			if (node)
				node.setAttribute('value', target.textContent);
			arr.forEach(value =>
			{
				value.classList.remove('option');
			});
			target.classList.add('option');
		});
	});
}
document.addEventListener("DOMContentLoaded", script);