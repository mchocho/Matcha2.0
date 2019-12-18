const faker = require('faker'),
	  //mysql = require('mysql'),
	  //conn = require('../models/sql_connect.js'),
	  query = "INSERT INTO users (username, first_name, last_name, gender, preferences, DOB, email, password, online, verified, biography) VALUES ?;",
	  gender = ['M', 'F'],
	  values = [
                      [
                        //           user.username,
                          //                                      user.f_name,
                            //                                    user.l_name,
                              //                                  user.gender.charAt(0),
                                //                                user.preference.charAt(0),
                                  //                              user.dob,
                                    //                            user.email,
                                      //                          user.password,
                                        //                        'F', 'F', ''
                                                          ]
                                                ];

for (let i = 0, n = 3; i < n; i++)
{
	values[0][0] = faker.name.findName();
	values[0][1] = faker.name.firstName();
	values[0][2] = faker.name.lastName();
	values[0][3] = gender[Math.floor(Math.random() * Math.floor(1))];
	values[0][4] = faker.date.past();
	values[0][5] = faker.internet.email();

	console.log(values);

	//conn.dbc.query(query, );
}
