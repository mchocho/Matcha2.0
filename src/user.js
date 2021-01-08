const express       = require("express");
const session       = require("express-session");
const path          = require("path");
const bcrypt        = require("bcryptjs");
const uuidv4        = require("uuid/v4");
const moment        = require("moment");
const formidable    = require("formidable");
const fs            = require("fs");
const util          = require("util");

const ft_util       = require("../includes/ft_util.js");
const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");

const router        = express.Router();

module.exports      = router;

router.get("/", (req, res) =>
{
    const sess  = req.session.user;

    if (!ft_util.isobject(sess))
    {
        res.redirect("/logout");
        return;
    }
    else if (sess.verified !== "T")
    {
        res.redirect("/verify_email");
        return;
    }
    else if (sess.valid !== "T")
    {
        res.redirect("/reported_account");
        return;
    }

    getAllUserImages();

    //Get all user images
    function getAllUserImages()
    {
        dbc.query(sql.selUserImages, [sess.id], (err, result) =>
        {
            if (err) {throw err}

            getUserViews(result);
        });
    }

    function getUserViews(images)
    {
        dbc.query(sql.selUserViews, [sess.id], (err, result) =>
        {
            if (err) {throw err}

            getUserTags(images, result.length);
        });
    }

    function getUserTags(images, viewcount)
    {

        dbc.query(sql.selUserTags, [sess.id], (err, result) => {
            if (err) {throw err}

            renderPage(images, viewcount, result);
        });
    }

    function renderPage(images, viewcount, tags)
    {

        Promise.all([
            ft_util.userNotificationStatus(dbc, Number(sess.id)),
            ft_util.getUserImages(dbc, sess.id),
            ft_util.getTagNames(dbc, tags)
        ])
        .then(values =>
        {
            const notifications = values[0].notifications;
            const chats         = values[0].chats;
            const profile_pic   = values[1][0];
            const user          = {
                images,
                viewcount,
                username        : sess.username,
                sex             : sess.gender,
                email           : sess.email,
                dob             : sess.DOB.slice(0, 10),
                first_name      : sess.first_name,
                last_name       : sess.last_name,
                preference      : sess.preferences,
                biography       : sess.biography,
                rating          : sess.rating,
                tags            : values[2]
            };

            res.render("user.pug", {
                user,
                chats,
                profile_pic,
                notifications,
                title           : "Your profile!"
            });
        })
        .catch(e => { throw (e) });
    }
});

/****

Should this live inside the api folder?

*****/

router.post("/image", (req, res) =>
{
    const sess     = req.session.user;
    const response = {
        key: "image",
        value: null
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and profile is valid
    if (!ft_util.isobject(sess))
    {
        console.log("1!");

        //Check if a file was uploaded and delete it
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
      console.log("2!");
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    handleIncomingFile();
    
    function handleIncomingFile()
    {
        const form = new formidable.IncomingForm();
        
        form.parse(req, (err, fields, files) =>
        {   
            console.log(files);

            if (!files.image)
            {
              console.log("3!");
                response.result = "No file uploaded.";
                res.end(JSON.stringify(response));
                return;
            }

            if (files.image.type.indexOf("image") === -1)
            {
              console.log("4!");
                response.result = "Please uploade an image file.";
                res.end(JSON.stringify(response));
                return;
            }

            console.log("What happend?");
            debugger;

            const imageType = files.image.type.split("/")[1];
            const filename  = uuidv4().replace(/\.|\//g, "").replace("\\", "") + "." + imageType; //strip all slashes
            const oldpath   = files.image.path;
            const newpath   = path.join(__dirname, "public/images/uploads/" + filename);

            if (ft_util.VERBOSE) {
                console.log(util.inspect({fields, files, newpath, oldpath}));
            }

            //Move uploaded file
            fs.rename(oldpath, newpath, err =>
            {
                if (err) {throw err}

                deleteCurrentDP(filename);
            });
        });
    }

    function deleteCurrentDP(filename)  //User may have only 1 picture
    {
        dbc.query(sql.delUserImages, [sess.id], (err, result) =>
        {
            if (err) {throw err}

            //Delete file in memory

            saveNewImage(filename);
        });
    }

    function saveNewImage(filename)
    {
        const insValues = [filename, sess.id, "T"];

        dbc.query(sql.insImage, [insValues], (err, result) =>
        {
            if (err) {throw err}

            response.result = "Success";
            response.filename = filename;
            res.end(JSON.stringify(response));
        });
    }
});

router.post("/fullname", (req, res) =>
{
    const sess      = req.session.user;
    const firstname = req.body.first;
    const lastname  = req.body.last;
    const response  = {
        key         : "fullname"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and names iare valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(firstname, lastname))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const first     = firstname.trim();
    const last      = lastname.trim();

    validateFullnames();

    function validateFullnames()
    {
        if (first.length === 0)
        {
            response.result = "Please enter your first name";
            res.end(JSON.stringify(response));
            return;
        }
        else if (last.length === 0)
        {
            response.result = "Please enter your last name";
            res.end(JSON.stringify(response));
            return;
        }

        saveNewFullname();
    }

    function saveNewFullname()
    {
        dbc.query(sql.updateUserFullname, [first, last, sess.id], (err, result) =>
        {
            if (err) {throw err}

            response.value = `${first} ${last}`;
            response.result = "Success";
            updateSession();
        });
    }

    function updateSession()
    {
        sess.first_name = first;
        sess.last_name  = last;

        req.session.save(err => {
            if (err) {throw err}

            res.end(JSON.stringify(response));
        });
    }
});

router.post("/new_username", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = {
        value,
        key         : "username"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and username is valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const name = value.trim();

    validateUsername();

    function validateUsername()
    {
        if (name.length > 2)
        {
            response.result = "Username must be at least 2 characters long";
            res.end(JSON.stringify(response));
            return;
        }
        checkIfUsernameExists();
    }

    function checkIfUsernameExists()
    {
        //Check if username exists
        dbc.query(sql.selCheckUsernameExists, [name], (err, result) =>
        {
            if (result.length > 0)
            {
                response.result = "Username already taken";
                res.end(JSON.stringify(response));
                return;
            }

            saveNewUsername();
        });
    }

    function saveNewUsername()
    {
        dbc.query(sql.updateUsername, [name, sess.id], (err, result) =>
        {
            if (result.affectedRows !== 1)
            {
                response.result = "Please try again";
                res.end(JSON.stringify(response));
                return;
            }

            updateSession();
        });
    }

    function updateSession()
    {
        sess.username = name;

        req.session.save(err =>
        {
            if (err) {throw err}

            response.result = "Success";
            res.end(JSON.stringify(response));
        });
    }
});

router.post("/new_email", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = {
        key         : "email"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and username is valid
    if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const email = value.trim();

    if (!ft_util.isEmail(email))
    {
        response.result = "Please enter an email address.";
        res.end(JSON.stringify(response));
        return;
    }

    //Check if email exists
    dbc.query(sql.selCheckUserEmailExists, [email], (err, result) =>
    {
        if (err) {throw err}

        if (result.length > 0)
        {
            response.result = "Email address is reserved.";
            res.end(JSON.stringify(response));
            return;
        }

        saveNewEmailAddress();
    });

    function saveNewEmailAddress()
    {
        dbc.query(sql.updateEmail, [email, sess.id], (err, result) =>
        {
            if (err) {throw err}

            response.value = email;
            response.result = "Success";
            updateSession();
        });
    }

    function updateSession()
    {
        sess.email = email;

        req.session.save(err =>
        {
            if (err) {throw err}

            res.end(JSON.stringify(response));
        });
    }
});

router.post("/reset_password", (req, res) =>
{
    const sess      = req.session.oldpw;
    const oldpw     = req.body.value;
    const newpw     = req.body.newpw;
    const confirmpw = req.body.confirmpw;
    const response  = {
        key         : "username"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and passwords valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(oldpw, newpw, confirmpw))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const email = value.trim();

    validatePassword();

    function validatePassword()
    {
        if (!ft_util.passwdCheck(oldpw))
        {
            response.result = "Please enter your current password.";
            res.end(JSON.stringify(response));
            return;
        }
        else if (!ft_util.passwdCheck(newpw))
        {
            response.result = "Please enter a new valid password.";
            res.end(JSON.stringify(response));
            return;
        }
        else if (oldpw === newpw)
        {
            response.result = "New password can't be current password";
            res.end(JSON.stringify(response));
            return;
        }
        else if (confirmpw !== newpw)
        {
            response.result = "The passwords you provided don't match.";
            res.end(JSON.stringify(response));
            return;
        }
        else if (bcrypt.compareSync(oldpw, sess.password))
        {
            response.result = "Incorrect password";
            res.end(JSON.stringify(response));
            return;
        }

        saveNewPassword();
    }

    function saveNewPassword()
    {
        const hash          = bcrypt.hashSync(confirmpw, ft_util.SALT);
        const updateValue   = [hash, sess.id];

        dbc.query(sql.updatePasswd, updateValue, (err, result) =>
        {
            if (err) {throw err}
            
            if (result.affectedRows !== 1) {
                response.result = "Please try again";
                res.end(JSON.stringify(response));
                return;
            }

            sess.password = hash;

            req.session.save(err =>
            {
                if (err) {throw err}

                response.result = "Success";
                res.end(JSON.stringify(response));
            });
        });
    }
});

router.post("/DOB", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = {
        key         : "DOB"
    };

    console.log(req.body);

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and username is valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const dob = value.trim();

    validateDOB();

    function validateDOB()
    {
        if (!moment(dob, "YYYY-MM-DD").isValid())
        {
            response.result = "Invalid date";
            res.end(JSON.stringify(response));
            return;
        }
        else if (!moment(dob).isBefore(moment().subtract(18, "years")))
        {
            response.result = "The age you specified is too young.";
            res.end(JSON.stringify(response));
            return;
        }

        saveNewDOB();
    }

    function saveNewDOB()
    {
        dbc.query(sql.updateUserDOB, [dob, sess.id], (err, result) =>
        {
            if (err) {throw err}

            response.value = dob;
            response.result = "Success";
            updateSession();
        });
    }

    function updateSession()
    {
        sess.DOB = dob;

        req.session.save(err => {
            if (err) {throw err}

            res.end(JSON.stringify(response));
        });
    }
});

router.post("/preferences", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = {
        key         : "preferences"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and preference is valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const preference = value;

    validatedPreferences();

    function validatedPreferences()
    {
        switch(preference)
        {
            case "M":
            case "F":
            case "B":
                saveNewPreference();
                break;
            default:
                response.result = "Failed";
                res.end(JSON.stringify(response));
                return;
        }
    }

    function saveNewPreference()
    {
        dbc.query(sql.updateUserPreferences, [preference, sess.id], (err, result) =>
        {
            if (err) {throw err}

            updateSession();
        });
    }

    function updateSession()
    {
        sess.preferences = preference;

        req.session.save(err => {
            if (err) {throw err}

            response.result = "Success";
            res.end(JSON.stringify(response));
        });
    }
});

router.post("/gender", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = {
        key         : "gender"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and gender is valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const gender = value;

    validateGender();

    function validateGender()
    {
        switch(gender)
        {
            case "M":
            case "F":
                saveNewGender();
                break;
            default:
                response.result = "Failed";
                res.end(JSON.stringify(response));
                return;
        }
    }

    function saveNewGender()
    {
        dbc.query(sql.updateUserGender, [gender, sess.id], (err, result) =>
        {
            if (err) {throw err}

            updateSession();
        });
    }

    function updateSession()
    {
        sess.gender = gender;

        req.session.save(err => {
            if (err) {throw err}

            response.result = "Success";
            res.end(JSON.stringify(response));
        });
    }
});

router.post("/interest", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;   //Lowercase all tags
    const response  = {
        key         : "interest"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and interest is valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const interest = value.trim().toLowerCase();

    validateInterest();

    function validateInterest()
    {
        if (interest.length < 2)
        {
            response.result = "Failed";
            res.end(JSON.stringify(response));
            return;
        }

        checkIfTagExists();
    }

    function checkIfTagExists()
    {
        //Check if tag already exists
        dbc.query(sql.selCheckTagExists, [interest], (err, result) =>
        {
            if (err) {throw err}

            if (result.length === 0)
                saveNewTag();
            else
                saveUserTag(result[0].id);
        });
    }

    function saveNewTag()
    {
        const insValues = [interest];

        dbc.query(sql.insNewTag, [insValues], (err, result) => {
            if (err) {throw err}

            saveUserTag(result.insertId);
        });
    }

    function saveUserTag(tagId)
    {
        const insValues = [sess.id, tagId];

        dbc.query(sql.insNewUserTag, [insValues], (err, result) => {
            if (err) {throw err}

            response.result = "Success";
            response.value = interest;
            res.end(JSON.stringify(response));
            return;
        });
    }
});

router.post("/rm_interest", (req, res) =>
{
    const sess      = req.session.user;
    const id        = req.body.value;
    const response  = {
        key         : "rm_interest",
        value       : id
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and id is valid
    if (!ft_util.isobject(sess) || isNaN(id))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    const delValues = [sess.id, id];

    //Remove user tag link
    dbc.query(sql.delUserTag, delValues, (err, result) =>
    {
        if (err) {throw err}

        response.result = "Success";
        res.end(JSON.stringify(response));
    });
});

router.post("/biography", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = {
        key         : "biography"
    };

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in and bio is valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }

    validateBio(value);

    function validateBio(bio)
    {
        if (bio.length > 3500) //Max chars is 4000
        {
            response.result = "Your biography is too long";
            res.end(JSON.stringify(response));
            return;
        }

        saveNewBio(bio);
    }

    function saveNewBio(bio)
    {
        dbc.query(sql.updateUserBio, [bio, sess.id], (err, result) =>
        {
            if (err) {throw err}

            updateSession(bio); 
        });
    }

    function updateSession(bio)
    {
        sess.biography = bio;

        req.session.save(err => {
            if (err) {throw err}

            response.result = "Success";
            res.end(JSON.stringify(response));
        });     
    }
});


router.post("/location", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body;
    const response  = {};

    res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    console.log(value);

    //User is logged in and bio is valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(value))
    {
        response.result = "Failed";
        res.end(JSON.stringify(response));
        return;
    }
    
    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;

});