const express       = require("express");
const session       = require("express-session");
const geo           = require("geolocation-utils");
const uuidv4        = require("uuid/v4");
const moment        = require("moment");
const util          = require("util");

const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");
const email         = require("../includes/mail_client.js");
const ft_util       = require("../includes/ft_util.js");
const msgTemplates  = require("../includes/email_templates.js");

let router          = express.Router();

module.exports      = router;


router.get("/:id?", (req, res) => 
{
  const sess          = req.session.user;
  const userSignedIn  = !!sess;
  const renderOptions = {
    userSignedIn,
    year: new Date().getFullYear()
  };

  const id            = Number(req.params.id);
  
  let location;
  let user;

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
  else if (isNaN(id) || sess.id === id)
  {
    res.redirect("/matcha");
    return;
  }

  dbc.query(sql.selUserById, [id], (err, result) =>
  {
    if (err) {throw err}
    
    //User does not exist
    if (result.length === 0)
    {
      res.redirect("/matcha");
      return;
    }

    checkIfProfileBlocked(result[0]);
  });

  function checkIfProfileBlocked(profile)
  {
    dbc.query(sql.selBlockedUser, [sess.id, profile.id], (err, result) =>
    {
      
      //Profile is blocked
      if (result.length > 0)
      {
        res.redirect("/matcha");
        return;
      }

      getProfileImages(profile);
    });
  }

  function getProfileImages(profile)
  {
    dbc.query(sql.selUserImages, [profile.id], (err, result) =>
    {
      if (err) {throw err}
      
      profile.images = result;
      getProfileTags(profile);
    });
  }

  function getProfileTags(profile)
  {
    dbc.query(sql.selUserTags, [profile.id], (err, result) =>
    {
      if (err) {throw err}

      profile.tags = result;
      getProfileConnectionDetails(profile);
    });
  }

  function getProfileConnectionDetails(profile)
  {
    const selValues = [sess.id, profile.id, profile.id, sess.id];

    dbc.query(sql.getConnectionStatus, selValues, (err, result) =>
    {
      if (err) {throw err}
      
      [...result].forEach(status =>
      {
        //                          user likes profile                profile liked user
        (status.liker === id) ? profile.userLikesProfile = true : profile.profileLikesUser = true;
      });

      profile.age       = moment(profile.DOB).fromNow(true);
      profile.last_seen = moment(profile.last_seen).fromNow();

      getProfileLocation(profile);
    });
  }

  function getProfileLocation(profile)
  {
    dbc.query(sql.selUserLocation, [profile.id], (err, result) =>
    {
      if (err) {throw err}

      //No location found
      if (result.length === 0)
      {
        res.redirect("/matcha");
        return;
      }

      profile.location = result[0];
      getUserLocation(profile);
    });
  }

  function getUserLocation(profile)
  {

    dbc.query(sql.selUserLocation, [sess.id], (err, result) =>
    {
      if (err) throw err;

      //No location found
      if (result.length === 0)
      {
        res.redirect("/matcha");
        return;
      }

      const profileLocation = profile.location;
      const userLocation = {
        lat: result[0]["lat"],
        lon: result[0]["lng"]
      }

      profile.distance = (geo.distanceTo(profileLocation, userLocation) / 1000).toFixed(2);
      increaseProfileViewCount(profile);
    });
  }

  function increaseProfileViewCount(profile)
  {
    const id            = profile.id;
    const insertValues  = [id, sess.id];

    dbc.query(sql.insNewView, [insertValues], (err, result) =>
    {
      if (err) throw err;

      createNewViewNotification(profile, result.insertId);
    });
  }

  function createNewViewNotification(profile, viewId)
  {
    const id            = profile.id;
    const insertValues  = [id, viewId, "views"];

    dbc.query(sql.insNewNotification, [insertValues], (err, result) =>
    {
      if (err) throw err;

      sortProfileDetails(profile);      
    });
  }

  function sortProfileDetails(profile)
  {
    //Async method cuts out the resolve/reject nonsense
    (async () =>
    {
      try
      {
        const tagNames      = await ft_util.getTagNames(dbc, profile.tags);
        const similarTags   = await ft_util.similarInterests(dbc, sess.id, profile.id);

        const notifications = await ft_util.userNotificationStatus(dbc, sess.id);
        const images        = await ft_util.getUserImages(dbc, sess.id);

        profile.tags = tagNames;

        //Mark similar tags
        similarTags.forEach(tag =>
        {
          profile.tags.forEach(profileTag =>
          {
            if (tag === profileTag.id)
              profileTag.similar = true;
          });
        });

        renderProfile(profile, notifications, images);
      }
      catch(e)
      {
        if (ft_util.VERBOSE)
          console.log("Failed to update profile details: ", e);

        //Couldn't update details
        res.redirect("/matcha");
      }
    })();
  }

  function renderProfile(profile, notifications, images)
  {
    renderOptions.profile       = profile;
    renderOptions.notifications = notifications.notifications;
    renderOptions.title         = profile.username;
    renderOptions.chats         = notifications.chats;
    renderOptions.profile_pic   = images[0];

    res.render("profile.pug", renderOptions); 
  }
});