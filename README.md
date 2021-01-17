# Matcha2.0
A web app that allows users to meet and connect❤️❤️❤️  
Matches are based on romantic & sexual interests, preferences and location. In that way, it is very similar to [Tinder](https://tinder.com/?lang=en)
 
## Requirements
- Nodejs & npm
- All dependencies listed in `package.json`
- A MySQL instance, eg. [Xampp](https://www.apachefriends.org/download.html) or [Mamp](https://bitnami.com/stacks/infrastructure)
- A local `.env` file
- Terminal access
- For editing ONLY: a text editor, eg. [VS Code](https://code.visualstudio.com/)
 
### Environment configs  
In order to run Matcha2.0 local credentials have to be set for DB setup & access  
In the root folder, create a `.env` file:  
```touch .env```  
Add credentials to `.env` file.
 
Example:  
```
DB_OS=<your os, eg. windows OR mac>
EMAIL_ADMIN_PASS= <your email service provider's pass word, eg. cupidsarrowstaff>
HOST=localhost
DB_USER=<your DB's user name, eg. root>
PORT=<the port you'll be using on localhost, eg. 3000>
DB_PASS=<your DB's pass word>
DB_NAME=matcha
#Required for Mac only
SOCKET_PATH=<the path to your mysql.sock file on your mamp/xampp server>
```
 
## Installation  
Clone the repository locally.  
Ensure your MySQL instance is running & the correct credentials are stored in teh `.env` file. 
 
To adjust the number of profiles that are pre-populated, open `config/profile_gen_two.js` and set the `count` variable to the desired number for profiles.   
 
### Setup databases (Required on first run only)  
Ensure the MySQL instance is running.  
Open a terminal session in the root folder:
```
cd config
node setup.js.
```
 
### Run (Post setup)  
Ensure the MySQL instance is running.  
Open a terminal session in the root folder.
Install all dependencies:
```
npm install
```
Once all dependencies are installed, run the project:
```
nodemon run dev
```
OR to run without [Nodemon](https://nodemon.io/):
```
npm start
```
 
A browser window at https://locahost:3000 (or configured port) should automatically open in the default browser. If it does not, please check the console / terminal for possible errors.
 
## Architecture  
### Technologies
Back end technologies:
- JavaScript
- Node.js
- Express.js
- socket.io
 
Front end technologies:
- HTML
- CSS
- JavaScript
- Bootstrap
- Pug
- Sass
 
Libraries / Modules / Dependencies:
- socket.io
- alertify.js
- bcryptjs
- body-parser
- bxslider
- connect-flash
- cors
- dotenv
- express-session
- faker
- flatpickr
- formidable
- geolocation-utils
- http
- lodash
- moment
- nodemailer
- nodemon
- uuid
 
Database Management Systems:
- mysql
- PhpMyAdmin
 
## Testing
https://github.com/wethinkcode-students/corrections_42_curriculum/blob/master/matcha.markingsheet.pdf
 
Test outline:
1. Launch web & database servers
2. Create an account
3. Login
4. Edit profile
5. View profile suggestions
6. Search / Filter
7. Geo-location
8. Popularity rating
9. Notifications
10. View a profile
11. Like / Unlike a user
12. Block a user
13. Message

Expected Outcome:

1. Backend server should start
2. You should be able to create an account
3. You should be able to login
4. You should be able to edit your profile
5. You should be able to view suggested profiles
6. People should have popularity rating
7. You should be able to search and filter profiles
8. Geo-location should be a feature
9. You should receive notifications
10. You should be able to view a profile
11. You should be able to like and unlike a user
12. You should be able to block a user
13. You should be able to chat with a user you liked and if they liked you back
