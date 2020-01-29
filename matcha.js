const express 		= require('express'),
	  geo			= require('geolocation-utils'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js'),
		sql	= require('./model/sql_statements');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	const sess = req.session.user;
	let	blacklist;
	let	location;
	let	matches;
	
	if (!ft_util.isobject(sess)) {
		res.redirect('/logout');
		return;
	} else if (sess.verified !== 'T') {
		req.session.destroy(function(err) {
			if (err) {throw err}
			res.redirect('/verify_email');
		});
		return;
	} else if (sess.valid !== 'T') {
		req.session.destroy(function(err) {
			if (err) {throw err}
			res.redirect('/reported_account');
		});
		return;
	}

	dbc.query(sql.selUserLocation, [sess.id], addUserLocation);

	function addUserLocation(err, result) {
		if (err) throw err;
		if (result.length === 0) {
			res.redirect('/user');
			return;
		}
		location = result[0];
		dbc.query(sql.selBlockedUsers, [sess.id], findPrefrences);
	}
		
	function findPrefrences(err, result) {
		if (err) {throw err}
		blacklist = result;
		let prefSql;
		if (sess.preferences === 'M') {
			prefSql = sql.selAllMale;
		} else if (sess.preferences === 'F') {
			prefSql = sql.selAllFemale;
		} else {
			prefSql = sql.selAllBoth;
		}
		dbc.query(prefSql, [sess.gender, sess.id], getMatches);
	}

	function getMatches(err, result) {
	if (err) throw err;
	matches = result;		
	if (matches.length > 0) {
		getMatchesImages();
	} else {
		res.render('matcha.pug', {
			title: "Find your match | Cupid's Arrow",
			users: []
		});
	} 
			
	function getMatchesImages(){
	for (let i = 0, n = matches.length; i < n; i++) {
		let ssql ="SELECT name FROM images WHERE user_id = ? AND profile_pic = 'T'";
		matches[i]['url'] = '/profile/' + matches[i].id;
		dbc.query(ssql, [matches[i].id], (err, result) => {
			if (err) throw err;
			matches[i].images = result;
			ssql = "SELECT * FROM locations WHERE user_id = ?";
			dbc.query(ssql, [matches[i].id], (err, result) => {
				if (err) throw err;
				if (result.length === 0) {
					console.log("VID", matches[i].id);
					console.log("XXXXXX");
					matches.splice(i, 1);
					i--;
					return;
				}
				matches[i]['distance'] = geo.distanceTo({lat: location.lat, lon: location.lng}, {lat: result[0]['lat'], lon: result[0]['lng']}).toFixed(2);
				console.log("Here", i, n - 1);
				if (i === n - 1) {
					console.log("Hello render");
					res.render('matcha.pug', {
						title: "Find your match | Cupid's Arrow",
						users: matches
					});
				}
			});
			});
		}		 
		}
	};
});
