function isFunction(value) {
  return Object.prototype.toString.call(value) == "[object Function]";
}

function xhr(url, method, body, callback, raw=false)
{
 	const DEVMODE = false;

	if (DEVMODE)
	{
		console.log("Beginning XMLHttpRequest");
		console.log("Sending request to ", url);
	}

  	let xhr = new XMLHttpRequest();

  	xhr.open(method, url);

  	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

	xhr.send(raw ? body : JSON.stringify(body));

  	xhr.onload = function()
  	{
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

function request(url, method, body, callback)
{
	const DEVMODE = false;

	fetch(url, {
		method,
		headers: {
			"Accept"		: "application/json, text/plain, */*",
			"Content-Type"	: "application/json"
		},
		body: JSON.stringify(body)
	})
	.then(response =>
	{
		response.text()
		.then(text =>
		{
			if (DEVMODE) {	
				console.log(`Status: ${response.status}: ${response.statusText}`);
				console.log(`Server response:\n ${text}`);
			}
			callback(JSON.parse(text));
		})
		.catch(e =>
		{ 
			console.log(e);
		});
	})
	.catch(e =>
		{
			console.log(e);
		});
}