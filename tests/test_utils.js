const ft_util = require('../includes/ft_util');

let string = 'qw12QW!@';
let bool = ft_util.hasuppercase(string);
console.log(bool);
bool = ft_util.haslowercase(string);
console.log(bool); 
bool = ft_util.hasNumber(string);
console.log(bool);
bool = isUpper(string);
console.log(bool);
bool = ft_haslowercase(string);
console.log(bool);



function isUpper(str) {
	for (let i = 0; i < str.length; i++) {
		if (str[i] >= 65 || str[i] <= 90) {
			return true;
		}
	}
	return false;
}

function ft_haslowercase(str) {
	for (let i = 0; i < str.length; i++) {
		if (str[i] >= 97 || str[i] <= 122) {
			return true;
		}
	}
	return false;
}