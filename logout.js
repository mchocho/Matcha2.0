const 	  express 		= require('express'),
	  session 		= require('express-session'),
	  app 			= express();

let router = express.Router();
module.exports = router;

router.get('/', (req, res) => {
    req.session.destroy(function() {
        res.redirect('/');
    });
});
