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
  const sess    = req.session.user;
  const id      = Number(req.params.id);
  
  let location;
  let user;

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

      profile.distance = geo.distanceTo(profileLocation, userLocation).toFixed(2);
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
    (async () => {
      try {
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
      catch(e) {
        if (ft_util.VERBOSE)
          console.log("Failed to update profile details: ", e);

        //Couldn't update details
        res.redirect("/matcha");
      }
    })();
  }

  function renderProfile(profile, notifications, images)
  {
    const renderOptions = {
      profile,
      title           : profile.username,
      notifications   : notifications.notifications,
      chats           : notifications.chats,
      profile_pic     : images[0]
    };

    res.render("profile.pug", renderOptions); 
  }
});



/****

Should this live inside the api folder?

*****/

router.post("/connect", (req, res) =>
{
  const sess      = req.session.user;
  const id        = req.body.value;
  const response  = {
    profile       : id,
    service       : "connect",
    youLikeUser   : false,
    userLikesYou  : false
  };

  console.log("BODY: ", req.body);

  res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

  //User is logged in, verified, valid, and profile is valid
  if (!ft_util.isobject(sess) || isNaN(id))
  {
    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;
  }
  else if (sess.verified !== "T" || sess.valid !== "T")
  {

    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;
  }
  
  if (ft_util.VERBOSE)
  {
    console.log("STATUS: " + res.statusCode);
    console.log("HEADERS: " + JSON.stringify(res.headers));
  }

  dbc.query(sql.selUserById, [id], (err, result) =>
  {
    if (err) {throw err}
    
    //User does not exist
    if (result.length === 0)
    {
      response.result = "Failed";
      res.end(JSON.stringify(response));
      return;
    }

    checkIfProfileBlocked(result[0]);
  });


  function checkIfProfileBlocked(profile)
  {
    dbc.query(sql.selBlockedUser, [sess.id, profile.id], (err, result) =>
    {
      if (err) {throw err}

      if (result.length > 0)
      {
        response.result = "Blocked";
        res.end(JSON.stringify(response));
        return;
      }

      checkAllUsersHaveImages(profile);
    });
  }

  function checkAllUsersHaveImages(profile)
  {
    Promise.all([
      ft_util.getUserImages(dbc, sess.id),
      ft_util.getUserImages(dbc, profile.id)
    ])
    .then((images) =>
    {
      const userImageUnavailable    = images[0].length === 0;
      const profileImageUnavailable   = images[1].length === 0;

      if (userImageUnavailable)
      {
        response.result = "You need a profile picture in order to connect with users.";
        res.end(JSON.stringify(response));
        return;
      }
      else if (profileImageUnavailable)
      {
        //user has no profile pic
        response.result = "You can't connect with a user with no profile picture.";
        res.end(JSON.stringify(response));
        return;
      }

      getProfileConnectionDetails(profile);
    })
    .catch(e =>
    {
      console.log("Failed to get user images: ", e);

      response.result = "Failed";
      res.end(JSON.stringify(response));
      return;
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
        (status.liker === profile.id) ? response.userLikesYou = true : response.youLikeUser = true;
      });

      checkUserLikeHistoryAvailable(profile);
    });
  }

  function checkUserLikeHistoryAvailable(profile)
  {
    const selValues = [sess.id, profile.id];

    dbc.query(sql.checkIfUserLikesSomeone, selValues, (err, result) =>
    {
      if (err) {throw err}

      const alreadyConnected = result.length > 0;
      const notificationId = (alreadyConnected) ? result[0].id : null;

      updateUserAndProfileConnection(profile, alreadyConnected, notificationId);
    });
  }

  function updateUserAndProfileConnection(profile, alreadyConnected, notificationId)
  {
    let statement;
    let values  = [sess.id, profile.id];

    if (response.youLikeUser)
      statement = sql.unlikeUser;     //Unlike the profile
    else if (alreadyConnected)
      statement = sql.likeUnlikedUser;  //Like the profile again
    else
    {
      statement = sql.insLike;      //Like the profile 1st time
      values    = [[sess.id, profile.id]];
    }

    dbc.query(statement, values, (err, result) =>
    {
      if (err) {throw err}

      response.result = "Success";
      response.youLikeUser = !response.youLikeUser;

      sendNotification(profile, notificationId, result);
    });
  }

  function sendNotification(profile, notificationId, queryResult)
  {
    const serviceId     = ((!response.youLikeUser) && notificationId) ? notificationId : queryResult.insertId;
    const type          = (!response.youLikeUser) ? "unlike" : "like";

    const insertValues  = [ profile.id, serviceId, type ];

    dbc.query(sql.insNewNotification, [insertValues], (err, result) =>
    {
      if (err) {throw err}

      emailUserProfile(profile);
    });
  }

  function emailUserProfile(profile)
  {
    const username      = sess.username;
    const emailAddress  = profile.email;

    let title;
    let msg;


    if (!response.youLikeUser)
    {
      title = `${username} unliked you... | Cupid"s Arrow`;
      msg   = msgTemplates.userUnliked(profile.username, username);
    }
    else if (profile.userLikesYou)
    {
      title = `${username} liked you back!❤️❤️❤️ | Cupid"s Arrow`;
      msg   = msgTemplates.connectedUserLiked(profile.username, username);
    }
    else
    {
      title = `${username} likes you! | Cupid"s Arrow`;
      msg   = msgTemplates.userLiked(profile.username, username);
    }
    
    email.main(emailAddress, title, msg).catch(console.error);
    
    updateFameRating(profile);
  }

  function updateFameRating(profile)
  {
    ft_util.updateFameRating(dbc, profile.id)
    .then(rating =>
    {
      response.rating = rating;
      res.end(JSON.stringify(response));
    })
    .catch(e =>
    {
      response.rating = sess.rating;
      res.end(JSON.stringify(response));
    });
  }
});


router.post("/report", (req, res) =>
{
  const sess      = req.session.user;
  const id        = req.body.value;
  const response  = {
    profile   : id,
    service   : "report_profile"
  };
  
  res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

  //User is logged in, verified, valid, and profile is valid
  if (!ft_util.isobject(sess) || isNaN(id))
  {
    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;
  }
  else if (sess.verified !== "T" || sess.valid !== "T")
  {
    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;
  }

  if (ft_util.VERBOSE)
  {
    console.log("STATUS: " + res.statusCode);
    console.log("HEADERS: " + JSON.stringify(res.headers));
  }

  dbc.query(sql.selUserById, [id], (err, result) =>
  {
    if (err) {throw err}
    
    //User does not exist
    if (result.length === 0)
    {
      response.result = "Failed";
      res.end(JSON.stringify(response));
      return;
    }

    checkIfProfileBlocked(result[0]);
  });


  function checkIfProfileBlocked(profile)
  {
    dbc.query(sql.selBlockedUser, [sess.id, profile.id], (err, result) =>
    {
      if (err) {throw err}

      if (result.length > 0)
      {
        response.result = "Blocked";
        res.end(JSON.stringify(response));
        return;
      }

      insertReportAccountToken(profile);
    });
  }

  function insertReportAccountToken(profile)
  {
    const token         = uuidv4();
    const url           = "http://localhost:3000/api/verification/?key=" + token;
    const insertValues  = [profile.id, token, "verification"]

    dbc.query(sql.insNewToken, [insertValues], (err, result) => {
      if (err) {throw err}

      profile.url = url;
      reportProfile(profile);
    });
  }

  function reportProfile(profile)
  {
    dbc.query(sql.reportUser, [profile.id], (err, result) => {
      if (err) {throw err}
      
      response.result = "Success";
      emailUserProfile(profile);
    });
  }

  function emailUserProfile(profile)
  {
    const emailAddress  = profile.email;
    const title         = "Your profile has been reported | Cupid's Arrow";
    const msg           = msgTemplates.report_account(profile.url);

    email.main(emailAddress, title, msg).catch(console.error);

    res.end(JSON.stringify(response));
  }
});

router.post("/block", (req, res) =>
{
  const sess      = req.session.user;
  const id        = req.body.value;
  const response  = {
    profile   : id,
    service   : "block"
  };
  
  res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client
  
  //User is logged in, verified, valid, and profile is valid
  if (!ft_util.isobject(sess) || isNaN(id))
  {
    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;
  }
  else if (sess.verified !== "T" || sess.valid !== "T")
  {
    response.result = "Failed";
    res.end(JSON.stringify(response));
    return;
  }

  if (ft_util.VERBOSE)
  {
    console.log("STATUS: " + res.statusCode);
    console.log("HEADERS: " + JSON.stringify(res.headers));
  }

  dbc.query(sql.selUserById, [id], (err, result) => {
    if (err) {throw err}
    
    //User does not exist
    if (result.length === 0)
    {
      response.result = "Failed";
      res.end(JSON.stringify(response));
      return;
    }

    checkIfProfileBlocked(result[0]);
  });


  function checkIfProfileBlocked(profile)
  {
    dbc.query(sql.selBlockedUser, [sess.id, profile.id], (err, result) =>
    {
      if (err) {throw err}

      const profileBlocked = result.length > 0;

      handleAccountConnection(profile, profileBlocked);
    });
  }

  function handleAccountConnection(profile, profileBlocked)
  {
    //Assume we're unblocking the profile
    let statement   = sql.delBlockedUser;
    let values      = [sess.id, profile.id];

    if (!profileBlocked)
    {
      //We're blocking the profile
      statement     = sql.insBlockedUser;
      values        = [[sess.id, profile.id]];
    }

    dbc.query(statement, values, (err, result) => {
      if (err) {throw err}

      if (result.affectedRows === 1)
      {
        response.result         = "Success";
        response.profileBlocked = !profileBlocked;
      }
      else
      {
        response.result         = "Failed";
        response.profileBlocked = profileBlocked;
      }
      res.end(JSON.stringify(response));
    });
  }
});