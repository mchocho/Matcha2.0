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

## Usage
Once Matcha2.0 is running, the app can be used on 
