const ft_util = require('../includes/ft_util');

let string = 'pw123456';
let bool = ft_util.hasuppercase(string);
console.log(bool);
bool = ft_util.haslowercase(string);
console.log(bool); 
bool = ft_util.hasNumber(string);
console.log(bool);
console.log(string);