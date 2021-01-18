const http    = require("https");
const moment  = require("moment");
const util    = require("util");

const dbc     = require("../model/sql_connect.js");
const sql     = require("../model/sql_statements.js");
const errs    = require("../model/error_messages.js");

const format  = /[ £!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};


module.exports = {
  VERBOSE: true,
  SALT: 10,
  isString()
  {
    return [...arguments].every(arg => Object.prototype.toString.call(arg) === "[object String]");
  },
  isObject()
  {
    return [...arguments].every(arg => Object.prototype.toString.call(arg) === "[object Object]");
  },
  isEmail(value)
  {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
  },
  ranint(max)
  {
    return Math.floor(Math.random() * Math.floor(max));
  },
  hasuppercase(str)
  {
    let char;

    for (let i = 0; i < str.length; i++)
    {
      char = str[i];
      if (isNaN(char) && !char.match(format) && char == char.toUpperCase())
      {
        return true;
      }
    }
    return false;
  },
  haslowercase(str)
  {
    let char;

    for (let i = 0; i < str.length; i++)
    {
      char = str[i];
      if (isNaN(char) && !char.match(format) && char == char.toLowerCase())
      {
        return true;
      }
    }
    return false;
  },
  hasNumber(value)
  {
    for (let i = 0; i < value.length; i++)
    {
      if (isNaN(value[i]) === false)
      {
        return true;
      }
    }
    return false;
  },
  removeBlockedUsers(matches, blacklist)
  {
    if (blacklist.length === 0)
    {
      return matches;
    }
    return matches.filter(match => !blacklist.some(value => value.blocked_user === match.id));
  },
  escape(str)
  {
    return str.replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  },
  locateUser()
  {
    return new Promise((resolve, reject) =>
    {
      const req = http.request("https://get.geojs.io/v1/ip/geo.json", (res) =>
      {
        let location = '';
        
        res.on('data', (result) =>
        {
          location = location + result;
        });
        
        res.on('end', () =>
        {
          resolve(location);
        });
        
        res.on('error', (result) =>
        {
          reject('Failed to locate user');
        });
      });
      req.end();
    });

  },
  getTagNames(tags)
  {
    //TODO: use innerjoins instead
    return new Promise((resolve, reject) =>
    {
      if (tags.length === 0)
        resolve([]);

      tags.forEach((tag, i) =>
      {
        dbc.query(sql.selTagName, [tag.tag_id], (err, result) =>
        {
          if (err) {throw err}

          if (result.length > 0)
            tag.name = result[0].name;

          if (i === tags.length - 1)
            resolve(tags);
        });
      });
    });
  },
  passwdCheck(passwd)
  {
    // Should we handle special chars specifically?
    if (passwd.length < 5)
      return false;

    if (!this.haslowercase(passwd) || !this.hasuppercase(passwd) || !this.hasNumber(passwd))
      return false;
    
    return true;
  },
  escapeStr(str)
  {
    return str.replace(/\\/g, "\\\\")
     .replace(/\$/g, "\\$")
     .replace(/'/g, "\\'")
     .replace(/"/g, "\\\"");
  },
  updateUserLocation(geo, rowExists, user)
  {
    return new Promise((resolve, reject) =>
    {
      const values = [];
      let   stm;

      if (rowExists === false)
      {
        stm = sql.insUserLocation;
        values.push([geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, user]);
      } else
      {
        stm = sql.updateUserLocation;
        values.push(geo.latitude, geo.longitude, '-', geo.city, geo.region, geo.country, user);
      }

      dbc.query(stm, values, (err, result) =>
      {
        if (err) {throw err}

        if (this.VERBOSE)
          console.log("Updated location data for user!");
        resolve(result);
      });
    });
  },
  replaceTag(tag)
  {
      return tagsToReplace[tag] || tag;
  },
  escapeHtmlTags(str)
  {
      return str.replace(/[&<>]/g, this.replaceTag);
  },
  totalUsers()
  {
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.selAllUserIds, (err, result) =>
      {
        if (err) {throw err}

        resolve(result.length);
      });
    });
  },
  getUser(id)
  {
    return new Promise((resolve, reject) =>
    {

      dbc.query(sql.selUserById, [id], (err, result) =>
      {
        if (err) {throw err}

        resolve(result[0]);
      })
    });
  },
  getUserImages(id)
  {
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.selUserImages, [id], (err, result) =>
      {
        if (err) {throw err}

        resolve(result);
      });
    });
  },
  totalInterestedUsers(id)
  {
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.getAllInterestedUsers, [id], (err, result) =>
      {
        if (err) {throw err}

        resolve(result.length);
      });
    });
  },
  totalConnections(id)
  {
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.getAllUserLikes, [id, id], (err, likes) =>
      {
        if (err) {throw err}

        if (likes.length == 0)
        {
          resolve(0);
          return;
        }

        resolve((likes.filter(like => likes.some(tmp => like.liker === tmp.liked)).length) / 2);
      });
    });
  },
  totalProfileBlocks(id)
  {
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.selAllIdsOfBlockedUser, [id], (err, results) =>
      {
        if (err) {throw err}

        if (results.length == 0)
        {
          resolve(0);
          return;
        }

        resolve(results.length);
      });
    });
  },
  updateFameRating(user, likeAction=true)
  {
    return new Promise((resolve, reject) =>
    {
      const id = user.id;

      Promise.all([
        this.totalUsers(),
        this.totalConnections(id),
        this.totalInterestedUsers(id),
        this.totalProfileBlocks(id)
      ])
      .then(values =>
      {
        const totalUsers           = values[0];
        const totalConnections     = values[1];
        const totalInterestedUsers = values[2];
        const totalProfileBlocks   = values[3];
        const currentRating        = user.rating;

        const update               = parseInt(Math.ceil((values[1] / values[0]) * 10));
        let   rating;

        if (likeAction && currentRating <= 10)
        {
          //Increase the rating
          rating = currentRating + update;

          if (totalProfileBlocks >= totalConnections || totalProfileBlocks >= totalInterestedUsers)
          {
            resolve(currentRating);
            return;
          }
          else if (rating > 10)
          {
            rating = 10;
          }
        }
        else
        {
          rating = currentRating - update;
        }

        dbc.query(sql.updateFameRating, [rating, id], (err, result) =>
        {
          if (err) {throw err}

          resolve(rating);
        });
      }).catch(reject);
    });
  },
  userNotificationStatus(id)
  {
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.checkNotifications, [id], (err, notificationRes) =>
      {
        if (err) {throw err}

        dbc.query(sql.checkChats, [id], (err, chatRes) =>
        {
          if (err) {throw err}

          const notifications = notificationRes.length > 0;
          const chats         = chatRes.length > 0;

          resolve({notifications, chats});
        });
      });
    });
  },
  similarInterests(user1, user2)
  {
    //Resolves a list of interest ids which user1 and user2 share
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.selUserTags, [user1], (err, user1Tags) =>
      {
        if (err) {throw err}

        if (user1Tags.length === 0)
        {
          resolve([]);
          return;
        }

        dbc.query(sql.selUserTags, [user2], (err, user2Tags) =>
        {
          if (err) {throw err}

          if (user2Tags.length === 0)
          {
            resolve([])
            return;
          }

          const similarTags = user1Tags.filter(t1 => user2Tags.some(t2 => t1.tag_id === t2.tag_id));

          resolve(similarTags.map(tag => tag.tag_id));
        });
      });
    });
  },
  getAllTags(matches)
  {
    const tagsArray2D = matches.map(match => match.tags);
    const tagsArray1D = tagsArray2D.reduce((prev, next) => prev.concat(next))

    return (this.uniqueArr(tagsArray1D));
  },
  uniqueArr(arr)
  {
    return [...new Set(arr)];
  },
  getAllUserLocations(users)
  {
    return new Promise((resolve, reject) =>
    {
      if (users.length === 0)
      {
        resolve(user);
        return;
      }

      const index = users.length - 1;

      users.forEach((user, i) =>
      {
        const userId = user.id;

        //getUserLocationRow()
        dbc.query(sql.selUserLocation, [userId], (err, location) =>
        {
          if (err) {throw err}

          if (user2Tags.length === 0)
          {
            resolve([])
            return;
          }

        });
      });
    });
  },
  filterMatches(matches, filter, arg1, arg2)
  {
    return new Promise((resolve, reject) =>
    {
      if (matches.length === 0)
      {
        resolve(matches);
        return;
      }

      (async () => {
        try
        {
          let result = matches;

          if (filter === "age")
            result = await this.filterMatchesByAge(matches, arg1, arg2)
          else if (filter === "rating")
            result = await this.filterMatchesByRating(matches, arg1, arg2)
          else if (filter === "location")
            result = await this.filterMatchesByGeo(matches, arg1);
          else if (filter === "tags")
            result = await this.filterMatchesByTag(matches, arg1);

          resolve(result);
        }
        catch(e)
        {
          reject(e);
        }
      })();
    });
  },
  filterMatchesByAge(matches, minAge, maxAge)
  {
    return new Promise((resolve, reject) =>
    {
      if (isNaN(minAge) || isNaN(maxAge))
      {
        resolve(matches);
        return;
      }

      const max = moment().subtract(maxAge, 'years');
      const min = moment().subtract(minAge, 'years');

      resolve(matches.filter(item => moment(item.DOB).isBetween(max, min)));
    });
  },
  filterMatchesByRating(matches, minRating, maxRating)
  {
    return new Promise((resolve, reject) =>
    {
      if (isNaN(minRating) || isNaN(maxRating))
      {
        resolve(matches);
        return;
      }

      resolve(matches.filter(item => item.rating > minRating && item.rating < maxRating));
    });
  },
  filterMatchesByGeo(matches, state, coutry=false)
  {
    return new Promise((resolve, reject) =>
    {
      let results = matches;

      if (country)
      {
        results = matches.filter(item => item.country === country)
      }

      resolve(results.filter(item => item.state === state));
    });
  },
  filterMatchesByTag(matches, tag)
  {
    return new Promise((resolve, reject) =>
    {
      resolve(matches.filter(item => item.interests.some(interest => interest === tag)));
    });
  },
  sortMatches(matches, sort, arg)
  {
    return new Promise((resolve, reject) =>
    {
      if (matches.length === 0)
      {
        resolve(matches);
        return;
      }

      (async () => {
        try
        {
          let result = matches;

          if (sort === "age")
            result = await this.sortMatchesByAge(matches)
          else if (sort === "location")
            result = await this.sortMatchesByDistance(matches);
          else if (sort === "rating")
            result = await this.sortMatchesByRating(matches);
          else if (sort === "tags")
            result = await this.sortMatchesByTags(matches, arg);

          resolve(result);
        }
        catch(e)
        {
          reject(e);
        }
      })();
    });
  },
  sortMatchesByAge(matches)
  {
    return new Promise((resolve, reject) =>
    {
      const length = matches.length;

      if (length === 0)
      {
        resolve(matches);
        return;
      }

      resolve(matches.sort((current, next) => parseInt(moment(current.DOB).fromNow()) - parseInt(moment(next.DOB).fromNow())));
    });
  },
  sortMatchesByDistance(matches)
  {
    //Sort by distance
    return new Promise((resolve, reject) =>
    {
      const length = matches.length;

      if (length === 0)
      {
        resolve(matches);
        return;
      }

      resolve(matches.sort((current, next) => parseInt(Math.round(current.distance)) - parseInt(Math.round(next.distance))));
    });
  },
  sortMatchesByRating(matches)
  {
    //Sort by rating
    return new Promise((resolve, reject) =>
    {
      const length = matches.length;

      if (length === 0)
      {
        resolve([]);
        return;
      }

      resolve(matches.sort((current, next) => current.rating - next.rating));
    });
  },
  sortMatchesByTags(matches, user)
  {
    return new Promise((resolve, reject) =>
    {
      //Sort by similar tags
      const length = matches.length;

      if (length === 0)
      {
        resolve(matches);
        return;
      }

      if (isNaN(user))
      {
        resolve(matches);
        return;
      }

      getUserTags.call(this, matches, user);

      function getUserTags(matches, user)
      {
        dbc.query(sql.selUserTags, [user], (err, tags) =>
        {
          if (err) {throw err}
          
          if (tags.length === 0)
          {
            resolve(matches);
            return;
          }

          getSimilarInterests.call(this, matches, user);
        });
      }

      function getSimilarInterests(matches, user)
      {
        const size = matches.length - 1;

        matches.forEach((value, i, arr) =>
        {
          this.similarInterests(user, value.id)
          .then(tags =>
          {
            value["similar_tags"] = {
              tags   : tags,
              length : tags.length
            };

            if (i === size)
              sortInterests(matches);
          });
        });
      }

      function sortInterests(matches)
      {
        resolve(matches.sort((current, next) => current.similar_tags.length - next.similar_tags.length));
      }
    });
  }
}
