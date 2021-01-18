const express   = require("express");
const geo       = require("geolocation-utils");

const ft_util   = require("../includes/ft_util.js");
const dbc       = require("../model/sql_connect.js");
const sql       = require("../model/sql_statements");

const app       = express();

app.use(express.static(__dirname + "/public"));

let router      = express.Router();
module.exports  = router;

router.get("/:filter?.:arg1?.:arg2?.:sort?", (req, res) =>
{
  const sess          = req.session.user;
  const userSignedIn  = !!sess;
  const renderOptions = {
    userSignedIn,
    title : "Find your match | Cupid's Arrow",
    users : [],
    year  : new Date().getFullYear()
  };

  if (!userSignedIn)
  {
    res.redirect("/logout");
    return;
  }
  else if (sess.verified !== 'T')
  {
    res.redirect("/verify_email");
    return;
  }
  else if (sess.valid !== 'T')
  {
    res.redirect("/reported_account");
    return;
  }

  const id = sess.id;

  getUserLocation(id);

  function getUserLocation(id)
  {
    console.log("Hello");
    dbc.query(sql.selUserLocation, [sess.id], (err, result) =>
    {
      if (err) {throw err};

      if (result.length === 0)
      {
        res.redirect("/user");
        return;
      }

      getBlockedUsers(result[0])
    });

  }

  function getBlockedUsers(location)
  {
    console.log("1");
    sess.location = location;

    dbc.query(sql.selBlockedUsers, [sess.id], (err, result) =>
    {
      if (err) {throw err}

      getUserPreferences(result)
    });
  }
    
  function getUserPreferences(blacklist)
  {
    console.log("2");
    let prefSql;
    
    if (sess.preferences === "M")
      prefSql = sql.selAllMale;
    else if (sess.preferences === "F")
      prefSql = sql.selAllFemale;
    else
      prefSql = sql.selAllBoth;

    dbc.query(prefSql, [sess.gender, sess.id], (err, result) =>
    {
      if (err) {throw err}

      getMatches(ft_util.removeBlockedUsers(result, blacklist));
    });
  }

  function getMatches(matches)
  {
    console.log("3");
    if (matches.length > 0)
      createProfileUrls(matches);
    else
      renderMatches(matches);
  } 
      
  function createProfileUrls(matches)
  {
    console.log("4");
    const size = matches.length - 1;

    matches.forEach(match =>
    {
      match["url"] = "/profile/" + match.id;
    });
    getMatchesImages(matches, size);
  }

  function getMatchesImages(matches, size)
  {
    console.log("5");
    matches.forEach((match, i, arr) =>
    {
      dbc.query(sql.selImagePath, [match.id], (err, result) =>
      {
        if (err) {throw err}
        
        match.images = result;

        if (i === size)
          getMatchesTags(matches, size);
      });
    });
  }

  function getMatchesTags(matches, size)
  {
    console.log("6");
    matches.forEach((match, i, arr) =>
    {
      match["tags"] = [];

      dbc.query(sql.selAllUserTagIds, [match.id], (err, userTags) =>
      {
        if (err) {throw err}

        getUserTagNames(userTags, matches, size, match, i);
      });
    });
  }

  function getUserTagNames(userTags, matches, size, match, i)
  {
    console.log("7");
    const size2 = userTags.length - 1;

    if (userTags.length === 0)
    {
      if (i === size)
        getMatchesLocations(matches, size);
      return;
    }

    userTags.forEach((userTag, j) =>
    {
      dbc.query(sql.selTagName, [userTag.tag_id], (err, tag) =>
      {
        if (err) {throw err}

        match.tags.push(tag.name);

        if (i === size && j === size2)
          getMatchesLocations(matches, size);
      });
    });
  }

  function getMatchesLocations(matches, size)
  {
    console.log("8");
    const location        = sess.location;
    const userLocation    = {
      lat: location.lat, 
      lon: location.lng
    };

    matches.forEach((match, i, arr) => {
      dbc.query(sql.selUserLocation, [match.id], (err, result) =>
      {
        if (err) throw err;

        if (result.length === 0)
        {
          //This user's location could not be found
          if (i === size)
            filterMatches(matches);
          return;
        }

        const matchLocation = {
          lat: result[0]["lat"], 
          lon: result[0]["lng"]
        };

        match["distance"] = (geo.distanceTo(userLocation, matchLocation) / 1000).toFixed(2);

        if (i === size)
          filterMatches(matches);
      });
    });
  }

  function filterMatches(matches)
  {
    console.log("9");
    const filter = req.body.filter;
    const arg1   = (filter === "tags") ? sess.id : req.body.arg1;
    const arg2   = req.body.arg2;

    renderOptions.filter = (filter === "age" || filter === "location" || filter === "tags" || filter === "rating") ? filter : "none";

    if (renderOptions.filter === "none")
    {
      sortMatches(matches);
      return;
    }

    ft_util.filterMatches(matches, filter, arg1, arg2)
    .then(sortMatches)
    .catch(console.error);
  }

  function sortMatches(matches)
  {
    console.log("10");
    const sort = req.body.sort;
    const id   = sess.id;

    renderOptions.sort = (sort === "age" || sort === "rating" || sort === "location" || sort === "tags") ? sort : "none";

    if (renderOptions.sort === "none")
    {
      renderMatches(matches);
      return;
    }

    ft_util.sortMatches(matches, sort, id)
    .then(renderMatches)
    .catch(console.error);
  }

  function renderMatches(matches)
  {
    const id = sess.id;

    Promise.all([
      ft_util.userNotificationStatus(id),
      ft_util.getUserImages(id),
     // ft_util.getAllUserLocations(matches)
    ])
    .then(values =>
    {
      renderOptions.users         = matches;
      renderOptions.notifications = values[0].notifications;
      renderOptions.chats         = values[0].chats;
      renderOptions.profile_pic   = values[1][0];
      renderOptions.areas         = values[2];
      //renderOptions.tags          = ft_util.getAllTags(matches);

      console.log(renderOptions);

      res.render("matcha.pug", renderOptions);
    }).catch(console.error);

  }
});