function script() {
	function reloadCSS() {
		const links = document.getElementsByTagName('link');
		console.log('Refreshing CSS');
		for (let i = 0, n = links.length; i < n; i++) {
			if (links[i].href.indexOf('cdn') === -1)
				links[i].href += "?";
                }
		console.log('CSS page refreshed.');
                return;
        };
	
	window.addEventListener('keyup', function(e) {
		if (e.keyCode === 101 || e.keyCode === 53) {    //Numpad 5
			reloadCSS();
		}
		return;
	});
}
document.addEventListener("DOMContentLoaded", script);
