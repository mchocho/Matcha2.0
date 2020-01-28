const ft_util = require('../includes/ft_util');

let test = {
	athing: "Words"
}

let test2 = "STRING";
let test3 = 1;
let test4 = function() {
	console.log("Hello function");
}
console.log(ft_util.isobject(test4()));