function isFunction(value) {
  return Object.prototype.toString.call(value) == '[object Function]';
}

function xhr(url, method, body, callback) {
 	const DEVMODE = true;

	if (DEVMODE)
		console.log("Beginning XMLHttpRequest");

  	let xhr = new XMLHttpRequest();

  	xhr.open(method, url);

	if (body != null)
		xhr.send(body);
	else
		xhr.send();		

  	xhr.onload = function() {
		if (DEVMODE) {
    			if (xhr.status != 200)
      				console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    			else
      				console.log(`Server response:\n ${xhr.responseText}`);
		}
		if (isFunction(callback))
			callback(xhr);
  	};

  	xhr.onerror = function() {
		console.log("Request failed");
  	};
}
