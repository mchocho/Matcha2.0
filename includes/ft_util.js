const http = require('https'),
	  sql  = require('../model/sql_statements.js'),
	  errs = require('../model/error_messages.js'),
	  format = /[ £!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
	  tagsToReplace = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
		};

function ft_isstring() {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) !== "[object String]");
			return false;
	return true;
}

function ft_isnumber(value) {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) !== "[object Number]");
			return false;
	return true;
}

function ft_isfunction(value) {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) !== "[object Function]")
			return false;
	return true;
}

function ft_isdate(value) {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) !== "[object Date]")
			return false;
	return true;
}


function ft_isobject(value) {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) !== '[object Object]')
			return false;
	return true;
}

function ft_isarray(value) {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(value) === '[object Array]')
			return false;
	return true;
}

function ft_isemail(value) {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
}

function ft_isEmptyObj(value) {
    for(var key in value) {
        if(value.hasOwnProperty(key))
            return false;
    }
    return true;
}

function ft_ranint(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function init_errorlist() {
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
}

// function ft_hasuppercase(value) {
// 	if (!ft_isstring(value)) return false;
// 	return (value.toLowerCase() != value);
// }

// Returns true on first occurence of uppercase char 
function ft_hasuppercase(str) {
	let char;
	for (let i = 0; i < str.length; i++) {
		char = str[i];
		if (isNaN(char) && !char.match(format) && char == char.toUpperCase()) {
			return true;
		}
	}
	return false;
}

// Returns true on first occurrence of lowercase char
function ft_haslowercase(str) {
	let char;
	for (let i = 0; i < str.length; i++) {
		char = str[i];
		if (isNaN(char) && !char.match(format) && char == char.toLowerCase()) {
			return true;
		}
	}
	return false;
}

// function ft_haslowercase(value) {
// 	if (!ft_isstring(value)) return false;
// 	return (value.toUpperCase() != value);
// }


// function ft_hasNumber(value) {
// 	if (!ft_isstring(value)) return false;
// 	return /\d/.test(value);
// }

// Returns true on first occurrence of digit
function ft_hasNumber(value) {
	for (let i = 0; i < value.length; i++) {
		if (isNaN(value[i]) === false) {
			return true;
		}
	}
	return false;
}

function validateUser(res, sess) {
	if (!ft_isobject(res))
		return;
	else if (!ft_isobject(sess))
		res.redirect('/..');
	else if (sess.verified !== 'T')
		res.redirect('/verify_email');
    else if (sess.valid !== 'T')
        res.redirect('/reported_account');
}

function ft_removeBlockedUsers(matches, blacklist) {
	return new Promise((resolve, reject) => {
		blacklist.forEach(function(value, index, arr) {
			for (let i = 0, n = matches.length; i < n; i++) {
				if (!'blocked_user' in value)
					continue;
				if (value.blocked_user === matches[i].id) {
					matches = matches.splice(i, 1);
					break;
				}
			}
		});
		resolve(matches);
	});
}

function ft_escape(str){
  if (!ft_isstring(str))
	return str;
  return str.replace(/&(?!\w+;)/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;');
}

function ft_locateUser(report) {
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
}

function ft_valueExists(dbc, table, key, value) {
	//Checks whether a given value already exists in a table
	return new Promise((resolve, reject) => {
		dbc.query("SELECT id FROM " + table + " WHERE " + key + " = ? LIMIT 1", [value], (err, result) => {
			if (err) {throw err}
			resolve(result);
		});
	});
}

function ft_getTagNames(dbc, tags) {
	//TODO: use innerjoins instead
	return new Promise((resolve, reject) => {
		if (tags.length === 0)
			resolve([]);
		for(let i = 0, n = tags.length; i < n; i++) {
			dbc.query(sql.selTagName, [tags[i].tag_id], (err, result) => {
				if (err) {throw err}
				if (result.length > 0) {
					tags[i]['name'] = result[0].name;
				}
				if (i === n - 1) {
					resolve(tags);
				}
			});
		}
	});
}

function ft_passwd_check(passwd)
{
	// Should we handle special chars specifically?
	if (passwd.length < 5) {
		return false;
	} 
	if (!ft_haslowercase(passwd) || !ft_hasuppercase(passwd) || !ft_hasNumber(passwd)) {
		return false;
	} 
	return true;
}

function ft_escapeStr(str) {
  return str.replace(/\\/g, "\\\\")
   .replace(/\$/g, "\\$")
   .replace(/'/g, "\\'")
   .replace(/"/g, "\\\"");
}

function ft_updateUserLocation(dbc, geo, rowExists, VERBOSE) {
	return new Promise((resolve, reject) => {
		const values = [];
		let stm;

		if (rowExists === false) {
			stm = sql.insUserLocation;
			values.push([geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, profile.id]);
		} else {
			stm = sql.updateUserLocation;
			values.push(geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, profile.id);
		}
		dbc.query(stm, values, (err, result) => {
			if (err) {throw err}
			if (VERBOSE) {
				console.log("Updated location data for user!!");
				console.log("Session object --> " + util.inspect(req.session));
			}
			resolve(result);
		});
	});
}

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}

function ft_escapeHtmlTags(str) {
    return str.replace(/[&<>]/g, replaceTag);
}

function ft_totalUsers(dbc) {
	return new Promise((resolve, reject) => {
		dbc.query(sql.selAllUserIds, (err, result) => {
			if (err) {reject(err)}
			resolve(result.length);
		});
	});
}

function ft_getUser(dbc, profile) {
	return new Promise((resolve, reject) => {
		if (isNaN(profile)) {reject(new Error(errs.invalidID))}
		dbc.query(sql.selUserById, [Number(profile)], (err, result) => {
			if (err) {reject(err)}
			resolve(result[0]);
		})
	});
}

function ft_totalUserLikes(dbc, profile) {
	return new Promise((resolve, reject) => {
		if (isNaN(profile)) {reject(new Error(errs.invalidID))}
		dbc.query(sql.getUserLikes, [Number(profile)], (err, result) => {
			if (err) {reject(err)}
			resolve(result.length);
		});
	});
}

function ft_updateFameRating(dbc, profile) {
	return new Promise((resolve, reject) => {
		if (isNaN(profile)) {reject(new Error(errs.invalidID))}

		Promise.all([ft_totalUsers(dbc), ft_totalUserLikes(dbc, profile)]).then(values => {
			const rating = parseInt(Math.ceil((values[1] / values[0]) * 10));
			dbc.query(sql.updateFameRating, [rating, Number(profile)], (err, result) => {
				if (err) {reject(new Error(errs.invalidID))}
				resolve(rating);
			});
		}).catch(e => {throw new Error(errs.fameRatingErr)});
	});
}

function ft_userNotificationStatus(dbc, profile) {
	return new Promise((resolve, reject) => {
		if (isNaN(profile)) {reject(new Error(errs.invalidID))}

		dbc.query(sql.checkNotifications, [profile], (err, notifications) => {
			if (err) {reject(err)}
			dbc.query(sql.checkChats, [profile], (err, chats) => {
				if (err) {reject(err)}
				resolve({notifications: (notifications > 0), chats: (chats > 0)});
			});
		});
	});
}

function ft_getConnectionStatus(dbc, client, profile) {
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
}

function ft_getUserNotifications(dbc, profile) {
	return new Promise((resolve, reject) => {
		let notifications,
			user;

		if (isNaN(profile)) {reject(new Error(errs.invalidID))}
		dbc.query(sql.selUserNotifications, [profile], (err, result) => {
			if (err) {reject(err)}
			notifications = result;
			if (notifications.length === 0) resolve([]);
			
			result.forEach((value, i , array) => {
				let type = value.type;

				dbc.query(
					(type === 'views') ? sql.selUserView : sql.selUserLike, 
					[value['service_id']], 
					(err, result) => {
						if (err) {reject(err)}
						user = (type === 'views') ? result[0].viewer : result[0].liker;

						ft_getUser(dbc, user).then((source) => {
							if (!ft_isobject(source)) {reject(new Error(err.invalidID))}
							value['source'] = source;
							ft_getConnectionStatus(dbc, profile, source.id).then((status) => {
								Object.assign(value, status);
								if (i === array.length - 1)
									resolve(array);
							}).catch(err => reject(err));
						}).catch(err => {reject(err)});
				});
			});
		});

	});
}

module.exports.VERBOSE = true;
module.exports.SALT = 10;
module.exports.isstring = ft_isstring;
module.exports.isnumber = ft_isnumber;
module.exports.isfunction = ft_isfunction;
module.exports.isdate = ft_isdate;
module.exports.isemail = ft_isemail;
module.exports.init_errors = init_errorlist;
module.exports.hasuppercase = ft_hasuppercase;
module.exports.haslowercase = ft_haslowercase;
module.exports.hasNumber = ft_hasNumber;
module.exports.emptyObj = ft_isEmptyObj;
module.exports.isobject = ft_isobject;
module.exports.isarray = ft_isarray;
module.exports.ranint = ft_ranint;
module.exports.validateUser = validateUser;
module.exports.removeBlockedUsers = ft_removeBlockedUsers;
module.exports.escape = ft_escape;
module.exports.locateUser = ft_locateUser;
module.exports.valueExists = ft_valueExists;
module.exports.getTagNames = ft_getTagNames;
module.exports.passwdCheck = ft_passwd_check;
module.exports.escapeStr = ft_escapeStr;
module.exports.updateUserLocation = ft_updateUserLocation;
module.exports.passwdCheck = ft_passwd_check; // This is for forgot password, don't remove for now
module.exports.escapeHtmlTags = ft_escapeHtmlTags;
module.exports.getUser = ft_getUser;
module.exports.totalUsers = ft_totalUsers;
module.exports.totalUsersLikes = ft_totalUserLikes;
module.exports.updateFameRating = ft_updateFameRating;
module.exports.userNotificationStatus = ft_userNotificationStatus;
module.exports.getUserNotifications = ft_getUserNotifications;