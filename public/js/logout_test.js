//Because I'm lazy
function script() {
    if (true) return;

	window.addEventListener('dblclick', function() {
        window.location.href = "/logout";
    });
}
document.addEventListener("DOMContentLoaded", script);
