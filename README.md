# Matcha2.0
 A web app that allows two potential lovers to meet and connect❤️❤️❤️

## Installation
Matcha2.0 is setup to use a MySQL DB locally, please go ahead and install your favourite MySQL server, eg: https://www.apachefriends.org/download.html 
or https://bitnami.com/stacks/infrastructure

After cloning do a npm install.
Indorder to connect Matcha2.0 to your MySQL DB please create a .env file with the following syntax in the root of the project: <br>  
`DB_OS=<"windows" or "mac">`  
`EMAIL_ADMIN_PASS=<your email service provider's pass word>`  
`HOST=localhost`  
`DB_USER=<your DB's user name>`  
`PORT=<the port you'll be using on localhast>`  
`DB_PASS=<your DB's pass word>`  
`DB_NAME=matcha`  
`#Mac only`  
`SOCKET_PATH=<the path to your mysql.sock file on your mamp/xampp server>`  
  
 To setup some dummy users, open up `config/profile_gen_two.js` and set `count` to the number of dummy users you would like to create.
 After doing that make sure to `$ cd config` and then run `$ node setup.js`, NB this will not work if you haven't moved to the config directory.
 
 ## Run
 To run with nodemon (live restart with changes) `$ npm run dev`, alternatively use `$ npm start`.
