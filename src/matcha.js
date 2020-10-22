const express 	= require("express");
const geo		= require("geolocation-utils");

const ft_util	= require("../includes/ft_util.js");
const dbc		= require("../model/sql_connect.js");
const sql		= require("../model/sql_statements");

const app 			= express();

app.use(express.static(__dirname + "/public"));

let router = express.Router();
module.exports = router;

router.get("/:filter?.:arg1?.:arg2?", (req, res) => {
	const sess 			= req.session.user;
	const renderOptions = {
		title: "Find your match | Cupid's Arrow",
		users: []
	};

	if (!ft_util.isobject(sess))
	{
		res.redirect("/logout");
		return;
	}
	else if (sess.verified !== "T")
	{
		req.session.destroy((err) => {
			if (err) {throw err}
			res.redirect("/verify_email");
		});
		return;
	}
	else if (sess.valid !== "T")
	{
		req.session.destroy((err) => {
			if (err) {throw err}
			res.redirect("/reported_account");
		});
		return;
	}

	dbc.query(sql.selUserLocation, [sess.id], (err, result) => {
		if (err) {throw err};

		getUserLocation(result)
	});

	function getUserLocation(result)
	{
		if (result.length === 0) {
			res.redirect("/user");
			return;
		}
		location = result[0];
		sess.location = location;

		dbc.query(sql.selBlockedUsers, [sess.id], (err, result) => {
			if (err) {throw err}

			getUserPreferences(result)
		});
	}
		
	function getUserPreferences(blacklist)
	{
		let prefSql;
		
		if (sess.preferences === "M")
			prefSql = sql.selAllMale;
		else if (sess.preferences === "F")
			prefSql = sql.selAllFemale;
		else
			prefSql = sql.selAllBoth;

		dbc.query(prefSql, [sess.gender, sess.id], (err, result) => {
			if (err) {throw err}

			getMatches(ft_util.removeBlockedUsers(result, blacklist));
		});
	}

	function getMatches(result)
	{
		matches = result;		
		
		if (matches.length > 0)
			createProfileUrls(matches);
		else
			res.render("matcha.pug", renderOptions);
	} 
			
	function createProfileUrls(matches)
	{	
		matches.forEach(match => {
			match["url"] = "/profile/" + match.id;
		});
		getMatchesImages(matches);
	}

	function getMatchesImages(matches)
	{	
		matches.forEach((match, i, arr) => {
			dbc.query(sql.selImagePath, [match.id], (err, result) => {
				if (err) {throw err}
				
				match.images = result;

				if (i === arr.length - 1)
					getMatchesLocations(matches);
			});
		});
	}

	function getMatchesLocations(matches)
	{
		const location 		= sess.location;

		matches.forEach((match, i, arr) => {
			dbc.query(sql.selUserLocation, [match.id], (err, result) => {
				if (err) throw err;

				if (result.length === 0)
				{
					if (i === arr.length - 1)
						renderMatches(matches);
					return;
				}

				const userLocation = {
					lat: location.lat, 
					lon: location.lng
				};
				const matchLocation = {
					lat: result[0]["lat"], 
					lon: result[0]["lng"]
				};

				match["distance"] = geo.distanceTo(userLocation, matchLocation).toFixed(2);

				if (i === arr.length - 1)
					renderMatches(matches);
			});
		});
	}

	function renderMatches(matches)
	{
		const filterType 	= req.params.filter;

		//Declare params here because sess.id might not exist
		const arg1 			= (filterType === "tags") ? sess.id : req.params.arg1;
		const arg2 			= req.params.arg2;

		Promise.all([
			ft_util.userNotificationStatus(dbc, Number(sess.id)),
			ft_util.getUserImages(dbc, sess.id),
			ft_util.filterMatches(dbc, matches, filterType, arg1, arg2)
		]).then((values) => {
			renderOptions.filter 		= (filterType === "age" || filterType === "location" || filterType === "tags" || filterType === "rating") ? filterType : "none";
			renderOptions.notifications = values[0].notifications;
			renderOptions.chats			= values[0].chats;
			renderOptions.profile_pic	= values[1][0];
			renderOptions.users 		= values[2];

			res.render("matcha.pug", renderOptions);
		}).catch(e => {throw e});

	}
});