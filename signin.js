const express 			= require('express'),
	  session	    	= require('express-session'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  util 			= require('util'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js'),
	  googleMapsClient  = require('@google/maps').createClient({key: 'AIzaSyAZBn1NrjeC0gbFW4Fua4XEHudaTwvpy2Q'});

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session[0];
	if (ft_util.isobject(sess))
		res.redirect('/matcha');
	res.render('signin.pug', {});
}).post('/', (req, res) => {
	const user = req.body;
	let errors = ft_util.init_errors(),
		result = true;
	if (user.cupid === 'Submit') {
		if (user.username.length === 0) {
			result = false;
			errors['error_0'] = 'Enter a username';
		}
		if (user.password.length === 0) {
			result = false;
			errors['error_1'] = 'Enter your password';
		}
		if (result === true) {
			let sql = "SELECT * FROM users WHERE (password = ? AND (username = ? OR email = ?))";

			dbc.query(sql, [user.password, user.username, user.username], (err, result) => {
				if (err) throw err;
				if (result.length == 0)
					res.render('signin', {error_2: 'Sorry, your email or password was incorrect.'});
				else if (result.verified === 'F')
					res.redirect('/verify_email');
				else
				{
					const id = result[0].id;
					sql = "SELECT id FROM locations WHERE user_id = ?";
					Object.assign(req.session, result);
					if (ft_util.VERBOSE === true) {
						console.log("User login result:\n");
						console.log(util.inspect(req.session));
					}
					dbc.query(sql, [id], (err, result) => {
						if (err) throw err;
						ft_util.locateUser(true).then(userLocation => {
							const geo = JSON.parse(userLocation),
							      locationData = [];
							googleMapsClient.reverseGeocode({latlng: {lat: geo.latitude, lng: geo.longitude}}, (err, response) => {
								if (!err /*&& response.length > 0*/) {
                        						// Handle response.
									if (ft_util.VERBOSE === true) {
                        							console.log(response);
                        							console.log("Result field");
                        							response.json.results.forEach((val, index) => {
                               								console.log("Result " + index);
                                							console.log(val);
											console.log("WTF");
                        							});
									}

									if (result.length === 0) {
										sql = "INSERT INTO locations (lat, lng, street_address, area, state, country, user_id) VALUES ?";

									}
									else {
										sql = "UPDATE locations SET (lat = ?, lng = ?, street_address = ?, area = ?, state = ?, country = ?) WHERE user_id = ?";
									}
									dbc.query(sql, [
										geo.latitude,
										geo.longitude,
										response[0].formatted_address,
										response[0].address_components[3].long_name,
										response[0].address_components[4].long_name,
										'South Africa',
										id
									], (err, result) => {
										if (err) throw err;
										console.log("Updated location data for user!!");
										req.session.save((err) => {
											res.redirect('/matcha');
										});
									});
								}
								else {
									
									if (ft_util.VERBOSE === true) {
										console.log('Failed to determine precise location of user');
										console.log('Error object: ' + util.inspect(err));
									}
									req.session.save((err) => {
										res.redirect('/user');
									});
								}
							});
					}).catch((err) => {
						if (ft_util.VERBOSE === true) {
							console.log('Failed to locate user');
							console.log('WTF');
						}
						req.session.save((err) => {
							res.redirect('/user');
						});

					});
				});
				}
			});
		} else {
			res.render('signin', {error_2: 'Sorry, your email or password was incorrect.'});
		}
	}
});
