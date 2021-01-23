const express       = require("express");

const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements");
const ft_util       = require("../includes/ft_util.js");

let router          = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body;
    const response  = {};

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    console.log(value);

    //User is logged in and bio is valid
    if (!ft_util.isObject(sess) )
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    
    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;

});