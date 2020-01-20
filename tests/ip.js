var http = require('https'),
	util = require('util'),
	ft_util = require('../includes/ft_util.js');


const urls = [
	'https://get.geojs.io/v1/ip/geo.json',
];

/*const req = http.request(urls[3], (res) => {
	console.log(`STATUS: ${res.statusCode}`);
  	console.log(`HEADERS: ${JSON.stringify(res.headers)}\n\n`);

	res.on('data', (chunk) => {
		console.log(`${chunk}`);
	});
}); 

req.end();*/


ft_util.locateUser(true).then(result => {
	const geo = JSON.parse(result);

	console.log(geo.region);
	return;
});
