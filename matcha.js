const express 		= require('express'),
	  path			= require('path'),
	  mysql			= require('mysql'),
	  body_p		= require('body-parser'),
	  URL			= require('url'),
	  ft_util		= require('./includes/ft_util.js'),
	  app 			= express(),
	  os			= require('os'),
	  email			= require('./includes/mail_client.js');

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
	res.render('matcha.pug', {
		title: 'Find your match',
		users: [
			/*{
				id: 1,
				username: 'Queen B',
				sex: 'F',
				first_name: 'Jane',
				last_name: 'Doe',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '19 km away',
				rating: 9,
				picture: 'https://i0.wp.com/pmchollywoodlife.files.wordpress.com/2014/07/beyonce-no-makeup-selfie-boston-july-1-ftr.jpg?crop=0px,0px,600px,460px&resize=1000,750'
			},
			{
				id: 1,
				username: 'Queen B',
				sex: 'F',
				first_name: 'Jane',
				last_name: 'Doe',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '19 km away',
				rating: 9,
				picture: 'https://i0.wp.com/pmchollywoodlife.files.wordpress.com/2014/07/beyonce-no-makeup-selfie-boston-july-1-ftr.jpg?crop=0px,0px,600px,460px&resize=1000,750'
			},
			{
				id: 2,
				username: 'Pixel Girl',
				sex: 'F',
				first_name: 'Mary',
				last_name: 'Jane',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '65 km away',
				rating: 9,
				picture: 'https://www.pixelstalk.net/wp-content/uploads/2016/08/Cute-Girl-Wallpaper-HD.jpg'
			},
			{
				id: 3,
				username: 'Habji',
				sex: 'F',
				first_name: 'Dorothy',
				last_name: 'Jane',
				preference: 'M',
				biography: "Today is a new day!",
				distance: '32 km away',
				rating: 9,
				picture: 'https://www.pixelstalk.net/wp-content/uploads/2016/08/Cute-Girl-Photography.jpg'
			}*/
		]
	});
});