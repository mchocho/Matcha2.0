document.addEventListener("DOMContentLoaded", script);

function script()
{
  if (!("google" in window))
    return;
  
  const mapOtions  = {
    center:            {lat: -34.397, lng: 150.644},
    zoom:              8,
    fullscreenControl: false,
    streetViewControl: false,
    panControl:        false,
    mapTypeControl:    false,
    scaleControl:      false,
    zoomControl:       false
  };
  const geoOptions = {
    enableHighAccuracy: true, 
    maximumAge        : 30000, 
    timeout           : 27000
  };

  const find_me    = document.getElementById("find_me");
  const map        = new google.maps.Map(document.getElementById("map"), mapOtions);
  
  const infoWindow = new google.maps.InfoWindow;

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(find_me);

  setTimeout(function()
  {
    find_me.classList.remove("hide");
  }, 1000);

  find_me.addEventListener("click", geolocateUser);

  function geolocateUser()
  {
    navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationFailed, geoOptions);
  }

  function onGeolocationSuccess(pos)
  {
    const geocoder   = new google.maps.Geocoder();
    const latlng     = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    
    //weThinkCode_'s ISP returns inaccurate positions   
    if ((latlng["lat"] === -26.2309    && latlng["lng"] === 28.0583)
     || (latlng["lat"] === -26.2123013 && latlng["lng"] === 28.0303075)
    )
    {
      latlng["lat"] = -26.205083;
      latlng["lng"] = 28.040148;
    }
    
    geocoder.geocode({location: latlng}, onReverseGeocoder);
  }

  function onGeolocationFailed()
  {
    alert("No position avaiable");
  }

  function onReverseGeocoder(results, status)
  {
    if (status === google.maps.GeocoderStatus.OK)
    {
      const marker   = new google.maps.Marker({map});
      const formData = new FormData();
      const result   = results[0];

      const latlng   = result.geometry.location;

      const user     = `<h3>Your location</h3>
                        Address: ${result.formatted_address}`;

      console.log(result);

      map.setZoom(19);
      map.setCenter(latlng);
      marker.setPosition(latlng);

      infoWindow.setContent(user);
      infoWindow.setPosition(latlng);
      infoWindow.setMap(map);

      //Send the data to server
      formData.append("type", "user_location");

      for (let key in result)
        formData.append(key, result[key]);

      /*const json = JSON.stringify({
        address:  result.address_components,
        location: latlng
      });*/

      xhr("/location", "POST", formData, function(xhr) {
        //Handle request or not
        console.log(xhr.responseText);
      });
    }
  }

}