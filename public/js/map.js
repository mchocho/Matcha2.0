function script() {
	if (!('google' in window))
		return;
	const find_me = document.getElementById('find_me'),
		  map = new google.maps.Map(document.getElementById('map'), {
	  	  	center: {lat: -34.397, lng: 150.644},
	  		zoom: 8,
	  		fullscreenControl: false,
	  		streetViewControl: false,
	  		panControl: true,
	  		mapTypeControl: false,
	  		scaleControl: false,
	  		zoomControl: false
		  }),
		  geocoder = new google.maps.Geocoder(),
		  marker = new google.maps.Marker({map: map}),
		  infoWindow = new google.maps.InfoWindow;

	map.controls[google.maps.ControlPosition.TOP_CENTER].push(find_me);
	setTimeout(function() {
		find_me.classList.remove('hide');
	}, 1000);


	function findUser(pos) {
		if (!pos.lat || !pos.lng)
			return;
		geocoder.geocode({
			location: pos
		}, function(results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				const form = new FormData();
				let user = '<h3>Your location</h3>';
				user += 'Address: ' + results[0].formatted_address;
				infoWindow.setContent(user);
				infoWindow.setMap(map);
				infoWindow.setPosition(pos);

				//Send the data to server
				formData.append('key', 'user_location');
				formData.append();
			}
		});
	}


	find_me.addEventListener('click', function() {
		navigator.geolocation.getCurrentPosition(function(position) {
			const pos = {lat: position.coords.latitude, lng: position.coords.longitude};
			//console.log(JSON.stringify(pos));
			if (pos['lat'] === -26.2309 && pos['lng'] === 28.0583
			 || pos['lat'] === -26.2123013 && pos['lng'] === 28.0303075
			) {
				pos['lat'] = -26.205083;
				pos['lng'] = 28.040148;
			}
			map.setZoom(19);
			marker.setPosition(pos);
			map.setCenter(pos);
			findUser(pos);
		}, function() {
			alert('No position avaiable');
		}, {
		  enableHighAccuracy: true, 
		  maximumAge        : 30000, 
		  timeout           : 27000
		});
	});
}

document.addEventListener("DOMContentLoaded", script);
