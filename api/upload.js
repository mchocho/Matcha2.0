const express       = require("express");
const path          = require("path");
const util          = require("util");
const formidable    = require("formidable");
const fs            = require("fs");
const uuidv4        = require("uuid/v4");

const ft_util       = require("../includes/ft_util.js");
const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");

const router        = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
  const sess         = req.session.user;
  const userSignedIn = !!sess;
  const response     = {
      key  : "image",
      value: null
  };

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

      if (!userSignedIn)
      {
        deleteUploadedFileAndRedirect(oldpath, "/logout");
        return;
      }
      else if (sess.verified !== 'T')
      {
        deleteUploadedFileAndRedirect(oldpath, "/verify_email");
        return;
      }
      else if (sess.valid !== 'T')
      {
        deleteUploadedFileAndRedirect(oldpath, "/reported_account");
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

  function deleteUploadedFileAndRedirect(filename, redirect)
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

      if (ft_util.VERBOSE)
      {
        console.log("File successfully uploaded!");
      }

      res.redirect("/user");
    });
  }
});