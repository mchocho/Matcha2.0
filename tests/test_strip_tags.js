let ft_util = require('../includes/ft_util');

let text = "<tag>'</tag>"

let test = ft_util.escapeHtmlTags(text);
console.log(test);
test = ft_util.escape(text);
console.log(test);