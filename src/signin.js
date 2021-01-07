const express       = require("express");
const bcrypt        = require("bcryptjs");
const util          = require("util");

const ft_util       = require("../includes/ft_util.js");
const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");

const redirect      = "/matcha";

let router          = express.Router();
module.exports      = router;

router.get("/", (req, res) => {
    const sess = req.session.user;

    //User already logged in
    if (ft_util.isobject(sess))
    {
        res.redirect(redirect);
        return;
    }

    let message = req.flash("message");
    res.render("signin.pug", {errors: []});

}).post("/", (req, res) => {
    const user      = req.body;
    const errors    = [];
    let valid       = true;

    if (user.cupid !== "Submit")
        valid = false;

    //Validate user input
    if (user.username.length === 0) {
        valid = false;
        errors[0] = "Enter a username";
    }
    if (user.password.length === 0) {
        valid = false;
        errors[1] = "Enter your password";
    }

    if (!valid)
    {
        errors[2] = "Sorry, your email or password was incorrect.";
        res.render("signin", { errors });
        return;
    }

    //Fetch user profile by username or email
    dbc.query(sql.selUserByAuth, [user.username, user.username], (err, result) =>
    {
        if (err) {throw err}

        validateAuth(result);
    });

    function validateAuth(result)
    {
        const errors    = [];
        const profile   = result[0];
        
        errors[2] = "Sorry, your email/username or password was incorrect.";
        if (result.length == 0)
        {
            //User does not exist 
            res.render("signin", { errors });
            return;
        }
        else if (!bcrypt.compareSync(user.password, profile.password))
        {
            //Password incorrect
            res.render("signin", { errors });
            return;
        }
        else if (profile.verified === "F")
        {
            //Unverified email
            res.redirect("/verify_email");
            return;
        }

        if (ft_util.VERBOSE)
            console.log(`User ${profile.username} [${profile.id }] logged in`);

        checkIfUserLocationExists(profile);
    }

    function checkIfUserLocationExists(profile)
    {
        //Check if user id is in locations table
        dbc.query(sql.selUserLocationId, [profile.id], (err, result) =>
        {
            if (err) {throw err}

            updateLocation(profile, result);
        });
    }

    function updateLocation(profile, result)
    {
        (async () => {
            try {
                //Create or update row
                const userIdExists = result.length > 0;

                //Get user position
                const userLocation   = await ft_util.locateUser();
                const geo           = JSON.parse(userLocation); //There"s a parsing issue

                //Sends new location to db
                const update = await ft_util.updateUserLocation(dbc, geo, userIdExists, profile.id);

                updateSessionAndRedirect(profile);
            }
            catch(e) {
                if (ft_util.VERBOSE)
                    console.log("Failed to update user location to db. Message: ", e);
                updateSessionAndRedirect(profile);
            }
        })();
    }

    function updateSessionAndRedirect(profile)
    {
        //Save profile
        req.session.user = profile;

        req.session.save(err =>
        {
            if (err) {throw err}

            //Redirect to matches
            res.redirect(redirect);
        });
    }
});