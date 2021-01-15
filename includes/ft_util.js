const http    = require('https');
const moment  = require('moment');
const util    = require('util');

const dbc     = require("../model/sql_connect.js");
const sql     = require('../model/sql_statements.js');
const errs    = require('../model/error_messages.js');

const format  = /[ £!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
};


module.exports = {
  VERBOSE: true,
  SALT: 10,
  isstring()
  {
    return [...arguments].every(arg => Object.prototype.toString.call(arg) === '[object String]');
  },
  isobject()
  {
    return [...arguments].every(arg => Object.prototype.toString.call(arg) === '[object Object]');
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
  totalUsersLikes(id)
  {
    return new Promise((resolve, reject) =>
    {
      dbc.query(sql.getUserLikes, [id], (err, result) =>
      {
        if (err) {throw err}

        resolve(result.length);
      });
    });
  },
  updateFameRating(id)
  {
    return new Promise((resolve, reject) =>
    {
      Promise.all([
        this.totalUsers(),
        this.totalUsersLikes(id)
        // this.totalProfileBlocks(dbc, id)
      ])
      .then(values =>
      {
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
          const chats     = chatRes.length > 0;

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

          if (type === 'age')
            result = await this.filterMatchesByAge(list, arg1, arg2)
          else if (type === 'location')
            result = await this.filterMatchesByGeo(list);
          else if (type === 'tags')
            result = await this.filterMatchesByTags(list, arg1)
          else if (type === 'rating')
            result = await this.filterMatchesByRating(list)

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

      const min = moment().subtract(minAge, 'years');
      const max = moment().subtract(maxAge, 'years');

      resolve(list.filter(item => moment(item.DOB).isBetween(max, min)));
    });
  },
  filterMatchesByGeo(list)
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
  filterMatchesByRating(list)
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

      resolve(list.sort((current, next) => parseInt(current.rating) - parseInt(next.rating)));
    });
  },
  filterMatchesByTags(list, user)
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
        list.forEach((value, i, arr) =>
        {
          this.similarInterests(user, value.id)
          .then(tags =>
          {
            value["similar_tags"] = {
              tags   : tags,
              length : tags.length
            };

            if (i === arr.length - 1)
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
