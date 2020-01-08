function script() {
	function reloadCSS() {
		const links = document.getElementsByTagName('link');
                         // y_coords = window.pageYoffset;
                         // y_coords = window.pageYoffset;
		for (let i = 0, n = links.length; i < n; i++) {
			links[i].href += "?";
                }
                // window.scrollTo(0, y_coords);
		console.log('CSS page refreshed.');
                return;
        };
	
	window.addEventListener('keyup', function(e) {
		if (e.keyCode === 101 || e.keyCode === 53) {    //Numpad 5
			console.log('Running reloadCSS');
			reloadCSS();
		}
		return;
	});
}
document.addEventListener("DOMContentLoaded", script);
