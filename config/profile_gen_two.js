const faker             = require('faker/locale/en_GB');
const util              = require('util');
const bcrypt            = require('bcryptjs');

const dbc               = require('../model/sql_connect.js');
const ft_util           = require('../includes/ft_util.js');

const count             = 10;
const maxDefaultImages  = 10;

const passwordValue     = "OMG42";
const password          = bcrypt.hashSync(passwordValue, 10);

generate_user(0);

function generate_user(i)
{
    if (i === count)
    {
      console.log(`Inserted ${count} profile records.`);
      process.exit();
    }

    const username  = faker.name.findName();
    const email     = faker.internet.email();


    /*const user = [
        faker.name.findName(),              //0
        faker.name.firstName(),             //1
        faker.name.lastName(),              //2
        ['M', 'F'][ft_util.ranint(2)],      //3
        ['M', 'F', 'B'][ft_util.ranint(3)], //4
        faker.date.between('1940-01-01', '2000-12-31'),             //5
        faker.internet.email(),             //6
        bcrypt.hashSync('OMG42', 10),                           //7
        ['T', 'F'][ft_util.ranint(1)],      //8
        'T',
        'T',
        faker.random.words()        
    ];
    let sql = "SELECT id FROM users WHERE username = ? OR email = ?",
        id;*/

    dbc.query(sql.usernameAndEmailUnreserved, [username, email], (err, result) =>
    {
        
      if (err) {throw err}

      if (result.length > 0)
      {
          console.log('Username or email already exists');
          generate_user(i);
          return;
      }

      const firstName   = faker.name.findName();
      const lastName    = faker.name.lastName();
      const gender      = ['M', 'F'][ft_util.ranint(2)];
      const preferences = ['M', 'F', 'B'][ft_util.ranint(3)];
      const dob         = faker.date.between("1900-01-01", "2000-12-31");
      const biography   = faker.random.words();
      const online      = ['T', 'F'][ft_util.ranint(1)];
      const verified    = 'T';
      const valid       = 'T';


      const user = [
        username,
        firstName,
        lastName,
        gender,
        preferences,
        dob,
        email,
        password,
        biography
        online,
        verified,
        valid
      ];

      dbc.query(sql.insNewDemoUser, [user], (err, result) => {
        if (err) {throw err}

        sql = "INSERT INTO images (name, user_id, profile_pic) VALUES (?)";
        id = result.insertId;

        imageGender = "women";
        if (user[3] == 'M') {
            imageGender = "men";
        }

        imagePath = imageGender 
            + "/" + ft_util.ranint(maxDefaultImages).toString()
            + ".jpg"

        dbc.query(sql, [[imagePath, id, 'T']], (err, result) => {
            if (err) throw err;
            sql = "INSERT INTO locations (lat, lng, street_address, area, state, country, user_id) VALUES (?)";
            dbc.query(sql, [[
                    faker.address.latitude(),
                    faker.address.longitude(),
                    faker.address.streetAddress() + ' ' + faker.address.streetName(),
                    faker.address.county(),
                    faker.address.state(),
                    faker.address.country(),
                    id
                ]], (err, result) => {
                if (err) throw err;
                //TODO set up random connections and user interests
                generate_user(i + 1);
            });
        });
      });
    });
}