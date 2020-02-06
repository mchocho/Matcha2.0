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
		for (let i = 0, n = arguments.length; i < n; i++)
			if (Object.prototype.toString.call(arguments[i]) !== "[object String]");
				return false;
		return true;
	},
	isnumber() {
		for (let i = 0, n = arguments.length; i < n; i++)
			if (Object.prototype.toString.call(arguments[i]) !== "[object Number]");
				return false;
		return true;
	},
	isfunction() {
		for (let i = 0, n = arguments.length; i < n; i++)
			if (Object.prototype.toString.call(arguments[i]) !== "[object Function]")
				return false;
		return true;
	},
	isdate() {
		for (let i = 0, n = arguments.length; i < n; i++)
			if (Object.prototype.toString.call(arguments[i]) !== "[object Date]")
				return false;
		return true;
	}
	,
	isobject() {
		for (let i = 0, n = arguments.length; i < n; i++)
			if (Object.prototype.toString.call(arguments[i]) !== '[object Object]')
				return false;
		return true;
	},
	isarray() {
		for (let i = 0, n = arguments.length; i < n; i++)
			if (Object.prototype.toString.call(arguments[i]) !== '[object Array]')
				return false;
		return true;
	},
	isemail(value) {
		return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
	},
	emptyObj(value) {
	    for(var key in value) {
	        if(value.hasOwnProperty(key))
	            return false;
	    }
	    return true;
	},
	ranint(max) {
		return Math.floor(Math.random() * Math.floor(max));
	},
	init_errors() {
		return {
			error_0: '',
			error_1: '',
			error_2: '',
			error_3: '',
			error_4: '',
			error_5: '',
			error_6: '',
			error_7: '',
			error_8: '',
		};
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
	validateUser(res, sess) {
		if (!this.isobject(res))
			return;
		else if (!this.isobject(sess))
			res.redirect('/..');
		else if (sess.verified !== 'T')
			res.redirect('/verify_email');
	    else if (sess.valid !== 'T')
	        res.redirect('/reported_account');
	},
	removeBlockedUsers(matches, blacklist) {
		return new Promise((resolve, reject) => {
			blacklist.forEach((value, index, arr) => {
				for (let i = 0, n = matches.length; i < n; i++) {
					if (!'blocked_user' in value)
						continue;
					if (value.blocked_user === matches[i].id) {
						matches.splice(i, 1);
						break;
					}
				}
			});
			resolve(matches);
		});
	},
	escape(str){
	  if (!this.isstring(str))
		return str;
	  return str.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
	},
	locateUser(report) {
		return new Promise((resolve, reject) => {
			const req = http.request("https://get.geojs.io/v1/ip/geo.json", (res) => {
	        		res.on('data', (result) => {
						if (report === true)
						{
							console.log(`Status: ${res.statusCode}`);
								console.log(`Headers: ${JSON.stringify(res.headers)}\n\n`);
									console.log(`${result}`);
						}
						resolve(result)
					});
				res.on('error', (result) => {
					reject('Failed to locate user');
				});
			});
			req.end();
		});
	},
	valueExists(dbc, table, key, value) {
		//Checks whether a given value already exists in a table
		return new Promise((resolve, reject) => {
			dbc.query("SELECT id FROM " + table + " WHERE " + key + " = ? LIMIT 1", [value], (err, result) => {
				if (err) {throw err}
				resolve(result);
			});
		});
	},
	getTagNames(dbc, tags) {
		//TODO: use innerjoins instead
		return new Promise((resolve, reject) => {
			if (tags.length === 0)
				resolve([]);
			for(let i = 0, n = tags.length; i < n; i++) {
				dbc.query(sql.selTagName, [tags[i].tag_id], (err, result) => {
					if (err) {throw err}
					if (result.length > 0) {
						tags[i]['name'] = result[0]['name'];
					}
					if (i === n - 1) {
						resolve(tags);
					}
				});
			}
		});
	},
	passwdCheck(passwd)
	{
		// Should we handle special chars specifically?
		if (passwd.length < 5) {
			return false;
		} 
		if (!this.haslowercase(passwd) || !this.hasuppercase(passwd) || !this.hasNumber(passwd)) {
			return false;
		} 
		return true;
	},
	escapeStr(str) {
	  return str.replace(/\\/g, "\\\\")
	   .replace(/\$/g, "\\$")
	   .replace(/'/g, "\\'")
	   .replace(/"/g, "\\\"");
	},
	updateUserLocation(dbc, geo, rowExists, user, VERBOSE) {
		return new Promise((resolve, reject) => {
			const values = [];
			let stm;

			if (rowExists === false) {
				stm = sql.insUserLocation;
				values.push([geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, user.id]);
			} else {
				stm = sql.updateUserLocation;
				values.push(geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, user.id);
			}
			dbc.query(stm, values, (err, result) => {
				if (err) {throw err}
				if (this.VERBOSE) {
					console.log("Updated location data for user!");
				}
				resolve(result);
			});
		});
	},
	replaceTag(tag) {
	    return tagsToReplace[tag] || tag;
	},
	escapeHtmlTags(str) {
	    return str.replace(/[&<>]/g, this.replaceTag);
	},
	totalUsers(dbc) {
		return new Promise((resolve, reject) => {
			dbc.query(sql.selAllUserIds, (err, result) => {
				if (err) {reject(err)}
				resolve(result.length);
			});
		});
	},
	getUser(dbc, profile) {
		return new Promise((resolve, reject) => {
			if (isNaN(profile)) {reject(new Error(errs.invalidID))}
			dbc.query(sql.selUserById, [Number(profile)], (err, result) => {
				if (err) {reject(err)}
				resolve(result[0]);
			})
		});
	},
	totalUsersLikes(dbc, profile) {
		return new Promise((resolve, reject) => {
			if (isNaN(profile)) {reject(new Error(errs.invalidID))}
			dbc.query(sql.getUserLikes, [Number(profile)], (err, result) => {
				if (err) {reject(err)}
				resolve(result.length);
			});
		});
	},
	updateFameRating(dbc, profile) {
		return new Promise((resolve, reject) => {
			if (isNaN(profile)) {reject(new Error(errs.invalidID))}

			Promise.all([this.totalUsers(dbc), this.totalUsersLikes(dbc, profile)]).then(values => {
				const rating = parseInt(Math.ceil((values[1] / values[0]) * 10));
				dbc.query(sql.updateFameRating, [rating, Number(profile)], (err, result) => {
					if (err) {reject(new Error(errs.invalidID))}
					resolve(rating);
				});
			}).catch(e => {throw new Error(errs.fameRatingErr)});
		});
	},
	userNotificationStatus(dbc, profile) {
		return new Promise((resolve, reject) => {
			if (isNaN(profile)) {reject(new Error(errs.invalidID))}

			dbc.query(sql.checkNotifications, [profile], (err, notifications) => {
				if (err) {reject(err)}
				dbc.query(sql.checkChats, [profile], (err, chats) => {
					if (err) {reject(err)}
					resolve({notifications: (notifications.length > 0), chats: (chats.length > 0)});
				});
			});
		});
	},
	getConnectionStatus(dbc, client, profile) {
		return new Promise((resolve, reject) => {
			if (isNaN(client) || isNaN(profile)) {reject(new Error(errs.invalidID))}
			const status = {userLikesYou: false, youLikeUser: false};

			dbc.query(sql.getConnectionStatus, [client, profile, profile, client], (err, result) => {
				if (err) {reject(err)}
				for (let i = 0, n = result.length; i < n; i++) {
					if (result[i].liker === profile)
						status.userLikesYou = true;
					if (result[i].liker === client)
						status.youLikeUser = true;
				}
				resolve(status);
			});
		});
	},
	getUserNotifications(dbc, profile) {
		return new Promise((resolve, reject) => {
			let notifications,
				query,
				user;

			if (isNaN(profile)) {reject(new Error(errs.invalidID))}
			dbc.query(sql.selUserNotifications, [profile], (err, result) => {
				if (err) {reject(err)}
				notifications = result;
				if (notifications.length === 0) resolve([]);
				
				result.forEach((value, i , arr) => {
					let type = value.type;

					if (type === 'views')
						query = sql.selUserView;
					else if (type === 'block')
						query = sql.selBlockedUserById;
					else
						query = sql.selUserLike;

					dbc.query(
						query,
						[value['service_id']], 
						(err, result) => {
							if (err) {reject(err)}

							if (type === 'views')
								user = result[0]['viewer'];
							else if (type === 'block')
								user = result[0]['blocked_user'];
							else
								user = result[0]['liker'];

							this.getUser(dbc, user).then((source) => {
								if (!this.isobject(source)) {reject(new Error(err.invalidID))}
								value['source'] = source;
								this.getConnectionStatus(dbc, profile, source.id).then((status) => {
									Object.assign(value, status);
									if (i === arr.length - 1)
										resolve(arr);
								}).catch(err => reject(err));
							}).catch(err => {reject(err)});
					});
				});
			});

		});
	},
	filterMatchesByAge(list, minAge, maxAge) {
		return new Promise((resolve, reject) => {
			if (list.length === 0 || isNaN(minAge) || isNaN(maxAge))
				resolve(list);
			
			const min = moment().subtract(Number(minAge), 'years'),
				  max = moment().subtract(Number(maxAge), 'years'),
				  filtered = [];

			for (let i = 0, n = list.length; i < n; i++) {
				if (moment(list[i]['DOB']).isBetween(max, min))
					filtered.push(list[i]);
			};
			resolve(filtered);
		});
	},
	filterMatchesByGeo(list) {
		return new Promise((resolve, reject) => {
			if (list.length === 0)
				resolve(list);

			//No async, no worry
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
					if (parseInt(current.rating) > parseInt(list[i + 1]['rating'])) {
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
	similarInterests(dbc, user1, user2) {
		return new Promise((resolve, reject) => {
			if (isNaN(user1) || isNaN(user2)) {reject(new Error(errs.invalidID))}

			const similarTags = [];
			let user1Tags, user2Tags;

			dbc.query(sql.selUserTags, [Number(user1)], (err, result) => {
				if (err) {reject(new Error(errs.invalidID))}
				if (result.length === 0) {
					resolve([]);
					return;
				}
				user1Tags = result;
				dbc.query(sql.selUserTags, [Number(user2)], (err, result) => {
					if (err) {
						reject(new Error(errs.invalidID));
						return;
					}
					if (result.length === 0) {
						resolve([])
						return;
					}

					user2Tags = result;
					user1Tags.forEach((value, i, arr) => {
						for (let j = 0, n = user2Tags.length; j < n; j++) {
							if (value.tag_id === user2Tags[j]['tag_id']) {
								similarTags.push(value.tag_id);
							}
						}
						if (i === arr.length - 1) {
							resolve(similarTags);
						}
					});
				});
			});
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
	},
	filterMatches(dbc, list, type, arg1, arg2) {
		return new Promise((resolve, reject) => {
			if (list.length === 0) {
				resolve(list);
				return;
			}

			if (type === 'age') {
				this.filterMatchesByAge(list, arg1, arg2).then(results => {
					resolve(results);
				}).catch(e => {reject(e)});
			} else if (type === 'location') {
				this.filterMatchesByGeo(list).then(results => {
					resolve(results);
				}).catch(e => {reject(e)});
			} else if (type === 'tags') {
				this.filterMatchesByTags(dbc, list, arg1).then(results => {
					resolve(results);
				}).catch(e => {reject(e)});
			} else if (type === 'rating') {
				this.filterMatchesByTags(dbc, list).then(results => {
					resolve(results);
				}).catch(e => {reject(e)});
			} else {resolve(list)}
		});
	},
	getUserImages(dbc, user) {
		return new Promise((resolve, reject) => {
			if (isNaN(user)) {reject(new Error(errs.invalidID)); return;}

			dbc.query(sql.selUserImages, [user], (err, result) => {
				if (err) {reject(err); return;}
				resolve(result);
			});
		});
	}
}