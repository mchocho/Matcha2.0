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
  const sess         = req.session.user;
  const userSignedIn = !!sess;

  if (!userSignedIn)
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
        userSignedIn,
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

router.post("/image", (req, res) =>
{
    const sess     = req.session.user;
    const response = {
        key  : "image",
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
          console.log("No file uploaded.");
          res.redirect("/user");

          return;
        }

        const imageType = files.image.type.split("/")[1];
        const oldpath   = files.image.path;

        if (files.image.type.indexOf("image") === -1)
        {
          console.log("Please uploade an image file.");
          res.redirect("/user");
          return;
        }

        if (!ft_util.isobject(sess))
        {
          deleteUploadedFile(oldpath, "/logout");

          return;
        }
        else if (sess.verified !== 'T')
        {
          deleteUploadedFile(oldpath, "/verify_email");

          return;
        }
        else if (sess.valid !== 'T')
        {
          deleteUploadedFile(oldpath, "/reported_account");

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

    function deleteUploadedFile(filename, redirect)
    {
      fs.unlink(filename, err =>
      {
        if (err) {throw err}

        res.redirect(redirect);
      });
    }

    function deleteCurrentDP(filename)
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

        res.redirect("/user");
      });
    }
});

router.post("*", (req, res, next) => {
  const sess      = req.session.user;

  if (!ft_util.isobject(sess))
  {
    console.log("Please sign in.");
    res.redirect("/logout");

    return;
  }
  else if (sess.verified !== 'T')
  {
    console.log("Your account is not verified."); 
    res.redirect("/verify_email");

    return;
  }
  else if (sess.valid !== 'T')
  {
    console.log();
    res.redirect("/reported_account");

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

    validateFullnames(first, last);

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

      req.session.save(err =>
      {
        if (err) {throw err}

        res.redirect("/user");
      });
    }
});

router.post("/username", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.username;
    const response  = {
        value,
        key         : "username"
    };


    if (!ft_util.isstring(value))
    {
      console.log("Please enter a new username");
      res.redirect("/user");

      return;
    }

    const name = value.trim();

    validateUsername();

    function validateUsername()
    {
      if (name.length < 2)
      {
        console.log("Username must be at least 2 characters long");
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
          console.log("Username already taken");
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
          console.log("Please try again");
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
        res.redirect("/user");
      });
    }
});

router.post("/email", (req, res) =>
{
    const sess      = req.session.user;
    const email     = req.body.email;
    const response  = { key : "email" };

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
      });
    }
});

router.post("/password", (req, res) =>
{
    const sess      = req.session.oldpw;
    const oldpw     = req.body.value;
    const newpw     = req.body.newpw;
    const confirmpw = req.body.confirmpw;
    const response  = {key : "username"};

    validatePassword();

    function validatePassword()
    {
      if (!ft_util.passwdCheck(oldpw))
      {
        console.log("Please enter your current password.");
        res.redirect("/user");

        return;
      }
      else if (!ft_util.passwdCheck(newpw))
      {
        console.log("Please enter a new valid password.");
        res.redirect("/user");
        
        return;
      }
      else if (oldpw === newpw)
      {
        console.log("New password can't be current password");
        res.redirect("/user");

        return;
      }
      else if (confirmpw !== newpw)
      {
        console.log("The passwords you provided don't match.");
        res.redirect("/user");

        return;
      }
      else if (bcrypt.compareSync(oldpw, sess.password))
      {
        console.log("Incorrect password");
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
          console.log("Please try again");
          res.redirect("/user");

          return;
        }

        updateSession(hash);
      });
        
      function updateSession(hash)
      {
        sess.password = hash;

        req.session.save(err =>
        {
          if (err) {throw err}

          res.redirect("/user");
        });
      }
    }
});

router.post("/DOB", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = { key : "DOB" };

    const dob = value.trim();

    validateDOB(dob);

    function validateDOB(dob)
    {
      if (!moment(dob, "YYYY-MM-DD").isValid())
      {
        console.log("Invalid date");
        res.redirect("/user");

        return;
      }
      else if (!moment(dob).isBefore(moment().subtract(18, "years")))
      {
        console.log("The age you specified is too young.");
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

        updateSession(dob);
      });
    }

    function updateSession(dob)
    {
      sess.DOB = dob;

      req.session.save(err =>
      {
        if (err) {throw err}

        res.redirect("/user");
      });
    }
});

router.post("/biography", (req, res) =>
{
    const sess      = req.session.user;
    const value     = req.body.value;
    const response  = { key : "biography" };

    // res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

    //User is logged in and bio is valid
    if (!ft_util.isstring(value))
    {
      console.log("Please enter something about yourself.");
      res.redirect("/user");

      return;
    }

    validateBio(value);

    function validateBio(bio)
    {
        if (bio.length > 3500) //Max chars is 4000
        {
          console.log("Please enter something about yourself.");
          res.redirect("/user");

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

        req.session.save(err =>
        {
            if (err) {throw err}

            res.redirect("/user");
        });     
    }
});