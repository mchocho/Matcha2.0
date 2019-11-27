function ready() {
	const params = (new URL(document.location)).searchParams;

	if (params.get('error_0'))
		document.getElementById('error_0').appendChild('');
}

document.addEventListener("DOMContentLoaded", ready);

