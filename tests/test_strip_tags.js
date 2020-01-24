let text = "Mc\"Do'nald";
cleanText = text.replace(/<\/?[^>]+(>|$)/g, "");

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
	'>': '&gt;',
	"'": '&#39;',
	'"': '&#34;'
};

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
    return str.replace(/[&<>'"]/g, replaceTag);
}

text = safe_tags_replace(text);
console.log(text);