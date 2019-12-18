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

function ft_isobject(value) {
	return (Object.prototype.toString.call(value) === '[object Object]');
}

function ft_isEmptyObj(value) {
    for(var key in value) {
        if(value.hasOwnProperty(key))
            return false;
    }
    return true;
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

module.exports.isstring = ft_isstring;
module.exports.isnumber = ft_isnumber;
module.exports.isfunction = ft_isfunction;
module.exports.isdate = ft_isdate;
module.exports.isemail = ft_isemail;
module.exports.init_errors = init_errorlist;
module.exports.emptyObj = ft_isEmptyObj;
module.exports.isobject = ft_isobject;
