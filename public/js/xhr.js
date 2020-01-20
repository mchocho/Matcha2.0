function xhr(url, method, body) {
 	const DEVMODE = true;

	if (DEVMODE)
		console.log("Beginning XMLHttpRequest");

  	let xhr = new XMLHttpRequest();

  	xhr.open(method, url);

  	xhr.send(body);

  	xhr.onload = function() {
		if (DEVMODE) {
    			if (xhr.status != 200)
      				console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    			else
      				console.log(`Server response:\n ${xhr.responseText}`);
		}
  	};

  	xhr.onerror = function() {
		console.log("Request failed");
  	};
}
