function script() {
	if (!'moment' in Window) return;
	const time = document.getElementsByTagName('time');

	for (let i = 0, n = time.length; i < n; i++) {
		const el = time[i],
			  val = el.getAttribute('datetime');

		el.textContent = moment(val).fromNow();
	}
}
document.addEventListener("DOMContentLoaded", script);