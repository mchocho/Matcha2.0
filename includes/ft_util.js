function ft_isstring() {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) !== "[object String]");
			return false;
	return true;
}

function ft_isnumber(value) {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) === "[object Number]");
			return false;
	return true;
}

function ft_isfunction(value) {
	for (let i = 0, n = arguments.length; i < n; i++)
		if (Object.prototype.toString.call(arguments[i]) === "[object Function]");
}

function ft_isdate(value) {
	return (Object.prototype.toString.call(arguments[i]) === "[object Date]");
}

function ft_isemail(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

module.exports.isstring = ft_isstring;
module.exports.isnumber = ft_isnumber;
module.exports.isfunction = ft_isfunction;
module.exports.isdate = ft_isdate;
module.exports.isemail = ft_isemail;
