var nodemailer = require('nodemailer');

async function main(to, subject, message) {
  	let testAccount = await nodemailer.createTestAccount(); // What's this for?

  	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'noreplycupidsarrow@gmail.com',
			pass: process.env.EMAIL_ADMIN_PASS
		}
	});

  	let info = await transporter.sendMail({
		from: '"Cupid\'s Arrow Admin" <noreplycupidsarrow@gmail.com>',
		to: to,
		subject: subject,
		html: message
 	});

  	console.log("Message sent: %s", info.messageId);
  	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = {
	main
}