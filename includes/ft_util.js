const http 		= require('https'),
	  moment	= require('moment'),
	  util		= require('util'),
	  sql 	 	= require('../model/sql_statements.js'),
	  errs 		= require('../model/error_messages.js'),
	  format 	= /[ £!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
	  tagsToReplace = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
		};


module.exports = {
	VERBOSE: true,
	SALT: 10,
	isstring() {
		return [...arguments].every(arg => Object.prototype.toString.call(arg) === '[object String]');
	},
	isnumber() {
		return [...arguments].every(arg => Object.prototype.toString.call(arg) === '[object Number]' || !isNaN(arg));
	},
	isobject() {
		return [...arguments].every(arg => Object.prototype.toString.call(arg) === '[object Object]');
	},
	isEmail(value) {
		return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
	},
	emptyObj(value) {
	    for(var key in value) {
	        if(value.hasOwnProperty(key))
	            return false;
	    }
	    return true;
	},
	isSetStr() {
		return [...arguments].every(arg => {
			if (!this.isstring(arg))
				return false; 
			return arg.length > 0;
		});
	},
	ranint(max) {
		return Math.floor(Math.random() * Math.floor(max));
	},
	hasuppercase(str) {
		let char;
		for (let i = 0; i < str.length; i++) {
			char = str[i];
			if (isNaN(char) && !char.match(format) && char == char.toUpperCase()) {
				return true;
			}
		}
		return false;
	},
	haslowercase(str) {
		let char;
		for (let i = 0; i < str.length; i++) {
			char = str[i];
			if (isNaN(char) && !char.match(format) && char == char.toLowerCase()) {
				return true;
			}
		}
		return false;
	},
	hasNumber(value) {
		for (let i = 0; i < value.length; i++) {
			if (isNaN(value[i]) === false) {
				return true;
			}
		}
		return false;
	},
	removeBlockedUsers(matches, blacklist) {
		if (blacklist.length === 0)
			return matches;
		return matches.filter(match => !blacklist.some(value => value.blocked_user === match.id));
	},
	escape(str){
	  if (!this.isstring(str))
		return str;
	  return str.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
	},
	locateUser()
	{
		return new Promise((resolve, reject) =>
		{
			const req = http.request("https://get.geojs.io/v1/ip/geo.json", (res) =>
			{
        		res.on('data', (result) =>
        		{
					if (true)
					{
						console.log(`Status: ${res.statusCode}`);
						console.log(`Headers: ${JSON.stringify(res.headers)}\n\n`);
						console.log(`RESULT: ${result}`);
					}
					resolve(result);
					return;
				});
				res.on('error', (result) =>
				{
					reject('Failed to locate user');
				});
			});
			req.end();
		});
	},
	getTagNames(dbc, tags)
	{
		//TODO: use innerjoins instead
		return new Promise((resolve, reject) =>
		{
			if (tags.length === 0)
				resolve([]);

			tags.forEach((tag, i) =>
			{
				dbc.query(sql.selTagName, [tag.tag_id], (err, result) =>
				{
					if (err) {throw err}

					if (result.length > 0)
						tag.name = result[0].name;

					if (i === tags.length - 1)
						resolve(tags);
				});
			});
		});
	},
	passwdCheck(passwd)
	{
		// Should we handle special chars specifically?
		if (passwd.length < 5)
			return false;
		if (!this.haslowercase(passwd) || !this.hasuppercase(passwd) || !this.hasNumber(passwd))
			return false;
		return true;
	},
	escapeStr(str) {
	  return str.replace(/\\/g, "\\\\")
	   .replace(/\$/g, "\\$")
	   .replace(/'/g, "\\'")
	   .replace(/"/g, "\\\"");
	},
	updateUserLocation(dbc, geo, rowExists, user) {
		return new Promise((resolve, reject) => {
			const values = [];
			let stm;

			if (rowExists === false) {
				stm = sql.insUserLocation;
				values.push([geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, user]);
			} else {
				stm = sql.updateUserLocation;
				values.push(geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, user);
			}

			dbc.query(stm, values, (err, result) => {
				if (err) {throw err}

				if (this.VERBOSE)
					console.log("Updated location data for user!");
				resolve(result);
			});
		});
	},
	replaceTag(tag)
	{
	    return tagsToReplace[tag] || tag;
	},
	escapeHtmlTags(str)
	{
	    return str.replace(/[&<>]/g, this.replaceTag);
	},
	totalUsers(dbc)
	{
		return new Promise((resolve, reject) =>
		{
			dbc.query(sql.selAllUserIds, (err, result) =>
			{
				if (err) {throw err}

				resolve(result.length);
			});
		});
	},
	getUser(dbc, profile)
	{
		return new Promise((resolve, reject) =>
		{

			dbc.query(sql.selUserById, [profile], (err, result) =>
			{
				if (err) {throw err}

				resolve(result[0]);
			})
		});
	},
	getUserImages(dbc, id)
	{
		return new Promise((resolve, reject) =>
		{
			dbc.query(sql.selUserImages, [id], (err, result) =>
			{
				if (err) {throw err}
				
				resolve(result);
			});
		});
	},
	totalUsersLikes(dbc, id)
	{
		return new Promise((resolve, reject) =>
		{
			dbc.query(sql.getUserLikes, [id], (err, result) =>
			{
				if (err) {throw err}

				resolve(result.length);
			});
		});
	},
	updateFameRating(dbc, id)
	{
		return new Promise((resolve, reject) =>
		{
			Promise.all([
				this.totalUsers(dbc),
				this.totalUsersLikes(dbc, id)
			])
			.then(values =>
			{
				const rating = parseInt(Math.ceil((values[1] / values[0]) * 10));

				dbc.query(sql.updateFameRating, [rating, id], (err, result) =>
				{
					if (err) {throw err}
					
					resolve(rating);
				});
			}).catch(reject);
		});
	},
	userNotificationStatus(dbc, id)
	{
		return new Promise((resolve, reject) =>
		{
			dbc.query(sql.checkNotifications, [id], (err, notificationRes) =>
			{
				if (err) {throw err}

				dbc.query(sql.checkChats, [id], (err, chatRes) =>
				{
					if (err) {throw err}

					const notifications = notificationRes.length > 0;
					const chats 		= chatRes.length > 0;

					resolve({notifications, chats});
				});
			});
		});
	},
	similarInterests(dbc, user1, user2)
	{
		return new Promise((resolve, reject) =>
		{
			dbc.query(sql.selUserTags, [user1], (err, user1Tags) =>
			{
				if (err) {throw err}

				if (user1Tags.length === 0)
				{
					resolve([]);
					return;
				}

				dbc.query(sql.selUserTags, [user2], (err, user2Tags) =>
				{
					if (err) {throw err}

					if (user2Tags.length === 0)
					{
						resolve([])
						return;
					}

					const similarTags = user1Tags.filter(t1 => user2Tags.some(t2 => t1.tag_id === t2.tag_id));

					resolve(similarTags.map(tag => tag.tag_id));


					/*user1Tags.forEach((value, i, arr) => {
						for (let j = 0, n = user2Tags.length; j < n; j++) {
							if (value.tag_id === user2Tags[j]['tag_id']) {
								similarTags.push(value.tag_id);
							}
						}
						if (i === arr.length - 1) {
							resolve(similarTags);
						}
					});*/
				});
			});
		});
	},
	filterMatches(dbc, list, type, arg1, arg2)
	{
		return new Promise((resolve, reject) =>
		{
			if (list.length === 0)
			{
				resolve(list);
				return;
			}

			(async () => {
				try
				{
					let result = list;

					if (type === 'age')
						result = await this.filterMatchesByAge(list, arg1, arg2)
					else if (type === 'location')
						result = await this.filterMatchesByGeo(list);
					else if (type === 'tags')
						result = await this.filterMatchesByTags(dbc, list, arg1)
					else if (type === 'rating')
						result = await this.filterMatchesByRating(list)

					resolve(result);
				}
				catch(e)
				{
					reject(e);
				}
			})();
		});
	},
	filterMatchesByAge(list, minAge, maxAge)
	{
		return new Promise((resolve, reject) =>
		{
			if (list.length === 0 || isNaN(minAge) || isNaN(maxAge))
			{
				resolve(list);
				return;
			}
			
			const min = moment().subtract(minAge, 'years');
			const max = moment().subtract(maxAge, 'years');
			// const filtered = [];

			resolve(list.filter(item => moment(item.DOB).isBetween(max, min)));

			/*for (let i = 0, n = list.length; i < n; i++) {
				if (moment(list[i]['DOB']).isBetween(max, min))
					filtered.push(list[i]);
			};
			resolve(filtered);*/
		});
	},
	filterMatchesByGeo(list) {
		return new Promise((resolve, reject) => {
			if (list.length === 0)
			{
				resolve(list);
				return;
			}

			for (let i = 0, n = list.length; i < n; i++) {
				let current = list[i];
				if (i + 1 < n) {
					let temp;
					if (parseInt(Math.round(current.distance)) > parseInt(Math.round(list[i + 1]['distance']))) {
						temp = list[i + 1];
						list[i + 1] = current;
						list[i] = temp;
						i = -1;
					}
				}
			}
			resolve(list);
		});
	},
	filterMatchesByRating(list) {
		return new Promise((resolve, reject) => {
			if (list.length === 0)
				resolve(list);

			//No async, no worry
			for (let i = 0, n = list.length; i < n; i++) {
				let current = list[i];
				if (i + 1 < n) {
					let temp;
					if (parseInt(current.rating) < parseInt(list[i + 1]['rating'])) {
						temp = list[i + 1];
						list[i + 1] = current;
						list[i] = temp;
						i = -1;
					}
				}
			}
			resolve(list);
		});
	},
	filterMatchesByTags(dbc, list, user) {
		return new Promise((resolve, reject) => {
			if (list.length === 0 || isNaN(user))
				resolve(list);

			const filtered = [];

			dbc.query(sql.selUserTags, [user], (err, result) => {
				if (err) {reject(new Error(errs.invalidID)); return;}
				if (result.length === 0) {
					resolve([]);
					return;	//It continues after resolve!
				}
				list.forEach((value, i, arr) => {
					this.similarInterests(dbc, user, value.id).then(tags => {
						value['similar_tags'] = {"tags": tags, "length": tags.length};

						if (tags.length !== 0) {
							if (this.VERBOSE === true) {
								console.log('User id %d has %c similar tag/s', value.id, tags.length);
							}
							filtered.push(value);
						}

						if (i === arr.length - 1) {
							for (let i = 0, n = filtered.length; i < n; i++) {
								let current = filtered[i]
								if (i + 1 < n) {
									let next = list[i + 1];
									let temp;
									if (current.similar_tags.length < next.similar_tags.length) {
										temp = next;
										list[i + 1] = current;
										list[i] = temp;
										i = -1;
										continue;
									}
								}
							}
							if (this.VERBOSE === true) {
								console.log('Filtered results: ', filtered);
							}
							resolve(filtered);
						}
					}).catch(e => {throw e});
				});
			});
		});
	}
}