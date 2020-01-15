var http = require('https'),
	util = require('util');


const urls = [
	'https://get.geojs.io/v1/ip/geo.json',
	'https://yts.lt/',
	'https://yts.lt/api/v2/list_movies.json',
	'https://yts.lt/api/v2/list_movies.json?quality=3D&page=3',
	'https://yts.lt/api/v2/list_movies.jsonp?genre=comedy&page=2'
];

const req = http.request(urls[3], (res) => {
	console.log(`STATUS: ${res.statusCode}`);
  	console.log(`HEADERS: ${JSON.stringify(res.headers)}\n\n`);

	res.on('data', (chunk) => {
		console.log(`${chunk}`);
	});
}); 

req.end();
