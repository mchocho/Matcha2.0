const http = require('https');

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
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

function ft_hasuppercase(value) {
	if (!ft_isstring(value)) return false;
	return (value.toLowerCase() != value);
}

function ft_haslowercase(value) {
	if (!ft_isstring(value)) return false;
	return (value.toUpperCase() != value);
}


function ft_hasNumber(value) {
	if (!ft_isstring(value)) return false;
	return /\d/.test(value);
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
	return new Promise((resolve, reject) => {
		dbc.query("SELECT id FROM " + table + " WHERE " + key + " = ?", [value], (err, result) => {
			if (err) {throw err}
			resolve(result.length > 0);
		});
	});
}

function ft_passwd_check(passwd)
{
	let numCheck = 0;
	if (passwd.length < 6) {
		return false;
	} else if (passwd.match('/[a-z]/') === false) {
		return false;
	} else if (passwd.match('/[A-Z]/') === false) {
		return false;
	} else if (passwd.match("/^[a-zA-Z0-9]+$/") === false) {
		 // No special chars or spaces
		return false;
	}
	for (let i = 0; i < passwd.length; i++) {
		if (isNaN(passwd[i]) === false) {
			numCheck++;
		}
	}
	if (numCheck === passwd.length) {
		return false;
	}
	return true;
}

module.exports.VERBOSE = true;
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
module.exports.passwdCheck = ft_passwd_check;
