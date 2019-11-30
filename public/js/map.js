function script() {
	if (!'google' in window)
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
	  		gestureHandling: "greedy",
	  		zoomControl: false
		  }),
		  marker = new google.maps.Marker({map: map}),
		  infoWindow = new google.maps.InfoWindow;

	map.controls[google.maps.ControlPosition.TOP_CENTER].push(find_me);
	setTimeout(function() {
		find_me.classList.remove('hide');
	}, 1000);


	function find_user(pos) {
		// body...
		if (!pos.lat || !pos.lng)
			return;
		const geocoder = new google.maps.Geocoder({
			location: pos
		}, function());
	}


	find_me.addEventListener('click', function() {
		navigator.geolocation.getCurrentPosition(function(position) {
			const pos = {lat: position.coords.latitude, lng: position.coords.longitude};
			if (pos['lat'] === -26.2309 && pos['lng'] === 28.0583) {
				pos['lat'] = -26.205083;
				pos['lng'] = 28.040148;
			}
			map.setZoom(19);
			marker.setPosition(pos);
			map.setCenter(pos);
			console.log("lat: " + pos.lat + '\nlng: ' + pos.lng);
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