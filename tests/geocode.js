const googleMapsClient	= require('@google/maps').createClient({key: 'AIzaSyAZBn1NrjeC0gbFW4Fua4XEHudaTwvpy2Q'}),
      util		= require('util'),
      ft_util		= require('../includes/ft_util.js');


ft_util.locateUser(true).then(result => {
	const geo = JSON.parse(result),
	      location = [geo.latitude, geo.longitude];

		console.log("Searching for address of: " + util.inspect(location));
	googleMapsClient.reverseGeocode({latlng: location}, (err, response) => {
		if (!err) {
     	 		// Handle response.
			console.log(response);
			console.log("Result field");

			response.json.results.forEach((val, index) => {
				console.log("Result " + index);
				console.log(val);

				console.log("Formatted address: ");
				console.log(val.formatted_address);
			});

			//console.log(result.json.results);
    		} else if (err === 'timeout') {
      			// Handle timeout.
			console.log("Request timed out");
    		} else if (err.json) {
      			// Inspect err.status for more info.
			console.log(err.status);
    		} else {
      			// Handle network error.
			console.log("Hey there...");
    		}
	});
});
