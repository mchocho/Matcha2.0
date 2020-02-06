const express 		= require('express'),
	  geo			= require('geolocation-utils'),
	  ft_util		= require('./includes/ft_util.js'),
	  dbc			= require('./model/sql_connect.js'),
	  sql			= require('./model/sql_statements'),
	  app 			= express();

app.use(express.static(__dirname + '/public'));
let router = express.Router();
module.exports = router;

router.get('/:filter?.:arg1?.:arg2?', (req, res) => {
	const sess = req.session.user,
		  filterType = req.params.filter;
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

	//Declare params here because sess.id might not exist
	const arg1 = (filterType === 'tags') ? sess.id : req.params.arg1,
		  arg2 = req.params.arg2;

	dbc.query(sql.selUserLocation, [sess.id], getUserLocation);

	function getUserLocation(err, result) {
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
		dbc.query(prefSql, [sess.gender, sess.id], (err, result) => {
			if (err) {throw err}
				// console.log('Preferences: ', result);
				ft_util.removeBlockedUsers(result, blacklist).then(matches => {
					getMatches(false, matches);
				}).catch(e => {
					getMatches(false, result);
				});
		});
	}

	function getMatches(err, result) {
		if (err) {throw err}
		matches = result;		
		if (matches.length > 0) {
			createProfileUrls();
		} else {
			res.render('matcha.pug', {
				title: "Find your match | Cupid's Arrow",
				users: []
			});
		}
	} 
			
	function createProfileUrls() {	
		for (let i = 0, n = matches.length; i < n; i++) {
			matches[i]['url'] = '/profile/' + matches[i].id;
		}
		getMatchesImages();
	}

	function getMatchesImages() {	
		let i = 0;
		let arrLen = matches.length;
		getEachImage(i);
		function getEachImage(i) {
			if (i < arrLen) {
				dbc.query(sql.selImagePath, [matches[i].id], (err, result) => {
					if (err) throw err;
					matches[i].images = result;
					i++;
					getEachImage(i);	
				});
			} else {
				getMatchesLocations();
			}
		}	
	}

	function getMatchesLocations() {
		let arrLen = matches.length;
		for (let i = 0; i < arrLen; i++) {
			dbc.query(sql.selUserLocation, [matches[i].id], (err, result) => {
				if (err) throw err;
				if (result.length === 0) {
					matches.splice(i, 1);
					i--;
					return;
				}
				matches[i]['distance'] = geo.distanceTo({
												lat: location.lat, 
												lon: location.lng
											}, 	
											{
												lat: result[0]['lat'], 
												lon: result[0]['lng']
											}).toFixed(2);
				if (i === arrLen - 1) {
					Promise.all([
						ft_util.userNotificationStatus(dbc, Number(sess.id)),
						ft_util.getUserImages(dbc, sess.id),
						ft_util.filterMatches(dbc, matches, filterType, arg1, arg2)
					]).then((values) => {
						res.render('matcha.pug', {
							title: "Find your match | Cupid's Arrow",
							notifications: values[0].notifications,
							chats: values[0].chats,
							profile_pic: values[1][0],
							filter: (filterType === 'age' || filterType === 'location' || filterType === 'tags' || filterType === 'rating') ? filterType : 'none',
							users: values[2]
						});
					}).catch(e => {throw e});
				}
			});
		}
	}	 
});
