const express   = require("express");
const session   = require("express-session");

const dbc       = require("../model/sql_connect.js");
const sql       = require("../model/sql_statements");
const ft_util   = require("../includes/ft_util.js");

const app       = express();
const router    = express.Router();

module.exports  = router;

router.get("/", (req, res) => {
	res.render('chat.pug', {
		title: "Chat | Cupid's Arrow"
	});
})
