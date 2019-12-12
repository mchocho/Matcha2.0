var nodemailer = require('nodemailer');

async function main(to, subject, message) {
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noreplycupidsarrow@gmail.com',
        pass: 'cupidsarrowstaff'
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