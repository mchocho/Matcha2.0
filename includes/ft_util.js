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
  getUser(profile)
  {
    return new Promise((resolve, reject) =>
    {

      dbc.query(sql.selUserById, [profile], (err, result) =>
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
      dbc.query(sql.getAllUserLikes, [id, id], (err, result) =>
      {
        if (err) {throw err}

        if (result.length == 0)
        {
          resolve(0);
          return;
        }

        const likes = [...result];

        resolve(likes.filter(like => likes.some(tmp => like.liker === tmp.liked)).length / 2);
      });
    });
  },
  totalProfileBlocks(id)
  {

  },
  updateFameRating(id)
  {
    return new Promise((resolve, reject) =>
    {
      Promise.all([
        this.totalUsers(),
        this.totalInterestedUsers(id),
        this.totalConnections(id)
        // this.totalProfileBlocks(id)
      ])
      .then(values =>
      {
        const totalUsers       = values[0];
        const totalLikes       = values[1];
        const totalConnections = values[2];

        const rating = parseInt(Math.ceil((values[1] / values[0]) * 10));

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
  filterMatches(list, type, arg1, arg2)
  {
    return new Promise((resolve, reject) =>
    {
      if (list.length === 0)
      {
        resolve(list);
        return;
      }

      (async () => {
        try
        {
          let result = list;

          if (type === "age")
            result = await this.filterMatchesByAge(list, arg1, arg2)
          else if (type === "rating")
            result = await this.filterMatchesByRating(list, arg1, arg2)
          else if (type === "location")
            result = await this.filterMatchesByGeo(list, arg1);
          else if (type === "tags")
            result = await this.filterMatchesByTag(list, arg1);

          resolve(result);
        }
        catch(e)
        {
          reject(e);
        }
      })();
    });
  },
  filterMatchesByAge(list, minAge, maxAge)
  {
    return new Promise((resolve, reject) =>
    {
      if (list.length === 0 || isNaN(minAge) || isNaN(maxAge))
      {
        resolve(list);
        return;
      }

      const max = moment().subtract(maxAge, 'years');
      const min = moment().subtract(minAge, 'years');

      resolve(list.filter(item => moment(item.DOB).isBetween(max, min)));
    });
  },
  filterMatchesByRating(list, minRating, maxRating)
  {
    return new Promise((resolve, reject) =>
    {
      if (list.length === 0 || isNaN(minRating) || isNaN(maxRating))
      {
        resolve(list);
        return;
      }

      resolve(list.filter(item => item.rating > minRating && item.rating < maxRating));
    });
  },
  filterMatchesByGeo(list, state, coutry=false)
  {
    return new Promise((resolve, reject) =>
    {
      let results = list;

      if (list.length === 0)
      {
        resolve(list);
        return;
      }

      if (country)
      {
        results = list.filter(item => item.country === country)
      }

      resolve(results.filter(item => item.state === state));
    });
  },
  filterMatchesByTag(list, tag)
  {
    return new Promise((resolve, reject) =>
    {
      if (list.length === 0)
      {
        resolve(list);
        return;
      }

      resolve(results.filter(item => item.interests.some(interest => interest.name === tag)));
    });
  },
  sortMatches(list, type, arg)
  {
    return new Promise((resolve, reject) =>
    {
      if (list.length === 0)
      {
        resolve(list);
        return;
      }

      (async () => {
        try
        {
          let result = list;

          if (type === "age")
            result = await this.sortMatchesByAge(list)
          else if (type === "location")
            result = await this.sortMatchesByDistance(list);
          else if (type === "rating")
            result = await this.sortMatchesByRating(list)
          else if (type === "tags")
            result = await this.sortMatchesByTags(list, arg)

          resolve(result);
        }
        catch(e)
        {
          reject(e);
        }
      })();
    });
  },
  sortMatchesByAge(list)
  {
    return new Promise((resolve, reject) =>
    {
      const length = list.length;

      if (length === 0)
      {
        resolve(list);
        return;
      }

      resolve(list.sort((current, next) => parseInt(moment(current.DOB).fromNow()) - parseInt(moment(next.DOB).fromNow())));
    });
  },
  sortMatchesByDistance(list)
  {
    //Sort by distance
    return new Promise((resolve, reject) =>
    {
      const length = list.length;

      if (length === 0)
      {
        resolve(list);
        return;
      }

      resolve(list.sort((current, next) => parseInt(Math.round(current.distance)) - parseInt(Math.round(next.distance))));
    });
  },
  sortMatchesByRating(list)
  {
    //Sort by rating
    return new Promise((resolve, reject) =>
    {
      const length = list.length;

      if (length === 0)
      {
        resolve([]);
        return;
      }

      resolve(list.sort((current, next) => current.rating - next.rating));
    });
  },
  sortMatchesByTags(list, user)
  {
    return new Promise((resolve, reject) =>
    {
      //Sort by similar tags
      const length = list.length;

      if (length === 0)
      {
        resolve(list);
        return;
      }

      if (isNaN(user))
      {
        resolve(list);
        return;
      }

      getUserTags.call(this, list, user);

      function getUserTags(list, user)
      {
        dbc.query(sql.selUserTags, [user], (err, tags) =>
        {
          if (err) {throw err}
          
          if (tags.length === 0)
          {
            resolve(list);
            return;
          }

          getSimilarInterests.call(this, list, user);
        });
      }

      function getSimilarInterests(list, user)
      {
        const size = list.length - 1;

        list.forEach((value, i, arr) =>
        {
          this.similarInterests(user, value.id)
          .then(tags =>
          {
            value["similar_tags"] = {
              tags   : tags,
              length : tags.length
            };

            if (i === size)
              sortInterests(list);
          });
        });
      }

      function sortInterests(list)
      {
        resolve(list.sort((current, next) => current.similar_tags.length - next.similar_tags.length));
      }
    });
  }
}
