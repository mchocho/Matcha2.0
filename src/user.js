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

    // res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    handleIncomingFile();
    
    function handleIncomingFile()
    {
        const form = new formidable.IncomingForm();
        
        form.parse(req, (err, fields, files) =>
        {   
            if (!files.image)
            {
              response.result = "No file uploaded.";
              res.redirect("/user");
              return;
            }

            const imageType = files.image.type.split("/")[1];
            const oldpath   = files.image.path;

            if (files.image.type.indexOf("image") === -1)
            {
              console.log("Please uploade an image file.");
              //deleteFile(oldpath);
              res.redirect("/user");
              return;
            }

            if (!ft_util.isobject(sess))
            {
                console.log("Please sign in.");
                //deleteFile(oldpath);
                res.redirect("/user");
                return;
            }
            else if (sess.verified !== 'T')
            {
                console.log("Your account is not verified.");
                //deleteFile(oldpath);
                res.redirect("/user");
                return;
            }
            else if (sess.valid !== 'T')
            {
                console.log("Your account has been reported");
                //deleteFile(oldpath);
                res.redirect("/user");
                return;
            }

            
            const filename  = uuidv4().replace(/\.|\//g, "").replace("\\", "") + "." + imageType; //remove all slashes
            const newpath   = path.join(__dirname, "../public/images/uploads/" + filename);

            if (ft_util.VERBOSE)
            {
              console.log("Uploaded file details...");
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
        const insValues = [filename, sess.id, 'T'];

        dbc.query(sql.insImage, [insValues], (err, result) =>
        {
            if (err) {throw err}

            console.log("File successfully uploaded!");
            response.result   = "Success";
            response.filename = filename;
            res.redirect("/user");
        });
    }
});

router.post("*", (req, res, next) => {
  const sess      = req.session.user;

  if (!ft_util.isobject(sess))
  {
      console.log("Please sign in.");
      res.redirect("/matcha");

      return;
  }
  else if (sess.verified !== 'T')
  {
      console.log("Your account is not verified.");
      req.session.destroy(err => {
        if (err) {throw err}
        
        res.redirect("/verify_email");
      });

      return;
  }
  else if (sess.valid !== 'T')
  {
     req.session.destroy(err => {
      if (err) {throw err}
      
      res.redirect("/reported_account");
    });

    return;
  }

  next();
});

router.post("/fullname", (req, res) =>
{
    const sess      = req.session.user;
    const firstname = req.body.first;
    const lastname  = req.body.last;
    const response  = {
        key         : "fullname"
    };

    console.log("Received message: ", req.body);

    if (!ft_util.isstring(firstname, lastname))
    {
        console.log("Please enter your first and last name.");
        res.redirect("/user");

        return;
    }

    const first     = firstname.trim();
    const last      = lastname.trim();

    validateFullnames();

    function validateFullnames(first, last)
    {
        if (first.length === 0)
        {
            console.log("Please enter your first name");
            res.redirect("/user");

            return;
        }
        else if (last.length === 0)
        {
          console.log("Please enter your last name");
          res.redirect("/user");

          return;
        }

        saveNewFullname(first, last);
    }

    function saveNewFullname(first, last)
    {
        dbc.query(sql.updateUserFullname, [first, last, sess.id], (err, result) =>
        {
            if (err) {throw err}

            console.log(`Successfully updated new name to ${first} ${last}`);
            updateSession(first, last);
        });
    }

    function updateSession(first, last)
    {
        sess.first_name = first;
        sess.last_name  = last;

        req.session.save(err => {
            if (err) {throw err}

            res.redirect("/user");
        });
    }
});

router.post("/new_username", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.username;
    const response  = {
        value,
        key         : "username"
    };

    /*if (!ft_util.isobject(sess))
    {
        console.log("Please sign in.");
        res.redirect("/user");
        return;
    }
    else if (sess.verified !== 'T')
    {
        console.log("Your account is not verified.");
        req.session.destroy(err => {
          if (err) {throw err}
          
          res.redirect("/verify_email");
        });

        return;
    }
    else if (sess.valid !== 'T')
    {
        console.log("Your account has been reported.");
        res.redirect("/user");
        return;
    }

      */

    if (!ft_util.isstring(value))
    {
        response.result = "Failed";
        console.log("");
        // res.end(JSON.stringify(response));
        res.redirect("/user");
        return;
    }

    const name = value.trim();

    validateUsername();

    function validateUsername()
    {
        if (name.length < 2)
        {
            response.result = "Username must be at least 2 characters long";
            // res.end(JSON.stringify(response));
            res.redirect("/user");
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
                // res.end(JSON.stringify(response));
                res.redirect("/user");
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
                // res.end(JSON.stringify(response));
                res.redirect("/user");
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
            // res.end(JSON.stringify(response));
            res.redirect("/user");
        });
    }
});

router.post("/new_email", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.email;
    const response  = {
        key         : "email"
    };

    /*// res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and username is valid
    if (!ft_util.isobject(sess) || sess.verified !== 'T' || sess.valid !== 'T' || !ft_util.isstring(value))
    {
        response.result = "Failed";
        // res.end(JSON.stringify(response));
        res.redirect("/user");
        return;
    }*/

    const email = value.trim();

    if (!ft_util.isEmail(email))
    {
        console.log("Please enter an email address.");
        res.redirect("/user");
        return;
    }

    //Check if email exists
    dbc.query(sql.selCheckUserEmailExists, [email], (err, result) =>
    {
        if (err) {throw err}

        if (result.length > 0)
        {
            console.log("Email address is reserved.");
            res.redirect("/user");
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

            res.redirect("/user");
            // res.end(JSON.stringify(response));
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

    /*// res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in, verified, valid, and passwords valid
    if (!ft_util.isobject(sess) || !ft_util.isstring(oldpw, newpw, confirmpw))
    {
        response.result = "Failed";
        // res.end(JSON.stringify(response));
        res.redirect("/user");
        return;
    }
    else if (sess.verified !== 'T' || sess.valid !== 'T')
    {
        response.result = "Failed";
        // res.end(JSON.stringify(response));
        res.redirect("/user");
        return;
    }*/

    const email = value.trim();

    validatePassword();

    function validatePassword()
    {
        if (!ft_util.passwdCheck(oldpw))
        {
            response.result = "Please enter your current password.";
            // res.end(JSON.stringify(response));
            res.redirect("/user");
            return;
        }
        else if (!ft_util.passwdCheck(newpw))
        {
            response.result = "Please enter a new valid password.";
            // res.end(JSON.stringify(response));
            res.redirect("/user");
            return;
        }
        else if (oldpw === newpw)
        {
            response.result = "New password can't be current password";
            // res.end(JSON.stringify(response));
            res.redirect("/user");
            return;
        }
        else if (confirmpw !== newpw)
        {
            response.result = "The passwords you provided don't match.";
            // res.end(JSON.stringify(response));
            res.redirect("/user");
            return;
        }
        else if (bcrypt.compareSync(oldpw, sess.password))
        {
            response.result = "Incorrect password";
            // res.end(JSON.stringify(response));
            res.redirect("/user");
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
            
            if (result.affectedRows !== 1)
            {
                response.result = "Please try again";
                // res.end(JSON.stringify(response));
                res.redirect("/user");
                return;
            }

            sess.password = hash;

            req.session.save(err =>
            {
                if (err) {throw err}

                response.result = "Success";
                // res.end(JSON.stringify(response));
                res.redirect("/user");
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

    const dob = value.trim();

    validateDOB(dob);

    function validateDOB(dob)
    {
        if (!moment(dob, "YYYY-MM-DD").isValid())
        {
            response.result = "Invalid date";
            res.redirect("/user");
            return;
        }
        else if (!moment(dob).isBefore(moment().subtract(18, "years")))
        {
            response.result = "The age you specified is too young.";
            res.redirect("/user");
            return;
        }

        saveNewDOB(dob);
    }

    function saveNewDOB(dob)
    {
        dbc.query(sql.updateUserDOB, [dob, sess.id], (err, result) =>
        {
            if (err) {throw err}

            response.value = dob;
            response.result = "Success";
            updateSession(dob);
        });
    }

    function updateSession(dob)
    {
        sess.DOB = dob;

        req.session.save(err => {
            if (err) {throw err}

            res.redirect("/user");
        });
    }
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