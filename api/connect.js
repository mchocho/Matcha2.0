const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");
const email         = require("../includes/mail_client.js");
const ft_util       = require("../includes/ft_util.js");
const msgTemplates  = require("../includes/email_templates.js");

let router          = express.Router();

module.exports      = router;

router.post("/", (req, res) =>
{
  const sess      = req.session.user;
  const id        = req.body.value;
  const response  = {
    profile       : id,
    service       : "connect",
    youLikeUser   : false,
    userLikesYou  : false
  };

  res.writeHead(200, {"Content-Type": "text/plain"}); //Allows us to respond to the client

  
  if (!ft_util.isobject(sess))
  {
      response.result = "Please sign in.";
      res.end(JSON.stringify(response));
      return;
  }
  else if (sess.verified !== 'T' || sess.valid !== 'T')
  {
      response.result = "Please verify your account.";
      res.end(JSON.stringify(response));
      return;
  }

  if (isNaN(id))
  {
    response.result = "Please specify a user to connect with.";
    res.end(JSON.stringify(response));
    return;
  }

  dbc.query(sql.selUserById, [id], (err, result) =>
  {
    if (err) {throw err}
    
    //User does not exist
    if (result.length === 0)
    {
      response.result = "Please specify a user to connect with.";
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
      const profileImageUnavailable = images[1].length === 0;

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
      const notificationId   = (alreadyConnected) ? result[0].id : null;

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

      response.result      = "Success";
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