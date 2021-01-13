const dbc           = require("../model/sql_connect.js");
const sql           = require("../model/sql_statements.js");
const email         = require("../includes/mail_client.js");
const ft_util       = require("../includes/ft_util.js");
const msgTemplates  = require("../includes/email_templates.js");

let router          = express.Router();

module.exports      = router;

router.post("/new", (req, res) => {
	const sess      = req.session.user;
  const id        = req.body.profile;
  const msg       = req.body.message;
  const response  = {
    profile       : id,
    service       : "new_message"
  };
  
  res.writeHead(200, {"Content-Type": "text/plain"});

  if (!ft_util.isobject(sess))
  {
    response.result = "Please sign in.";
    res.end(JSON.stringify(response));
    return;
  }
  else if (sess.verified !== 'T' || sess.valid !== 'T')
  {
    response.result = "Please verify your account.";
    res.end(JSON.stringify(response));
    return;
  }

  if (ft_util.isstring(msg))
  {
    response.result = "Enter a message to send.";
    res.end(JSON.stringify(response));
    return;
  }

  getUser(msg, id);

  function getUser(msg, id)
  {
    dbc.query(sql.selUserById, [id], (err, result) =>
    {
      if (err) {throw err}
    
      //User does not exist
      if (result.length === 0)
      {
        response.result = "Please specify a recipient.";
        res.end(JSON.stringify(response));
        return;
      }

      const user = result[0];

      checkIfUserIsBlocked(msg, user);
    });
  }

  function checkIfUserIsBlocked(msg, user)
  {
    dbc.query(sql.selBlockedUser, [user.id, sess.id], (err, result) =>
    {
      if (err) {throw err}

      //User is blocked
      if (result.length > 0)
      {
        response.result = "This user has blocked you.";
        res.end(JSON.stringify(response));
        return;
      }

      fetchChatId(msg, user);
      
    });
  }

  function fetchChatId(msg, user)
  {
    db.query(sql.getAllUserChats, [sess.id, sess.id], (err, result) =>
    {
      if (err) {throw err}

      if (result.length === 0)
      {
        createNewChat(msg, user);
        return;
      }

      const chats = [...result];
      let   chatId;

      if (chats.some(chat => chat.user_one === user.id || chat.user_two === user.id))
      {
        chatId = chats.filter(chat => chat.user_one === user.id || chat.user_two === user.id)[0].id;
        saveNewChatMessage(chatId, msg, user);

        return;
      }

      createNewChat(msg, user);
    });
  }

  function createNewChat(msg, user)
  {
    db.query(sql.insNewChat, [sess.id, user.id], (err, result) =>
    {
      if (err) {throw err}



      saveNewChatMessage();

    }
  }

  function saveNewChatMessage(chatId, msg, user)
  {
    dbc.query(sql.insNewChatMessage, [chatId, sess.id, msg], (err, result) =>
    {
      //INSERT INTO `user_chat` (`user_one`, `user_two`, `message`) VALUES (?)
      if (err) {throw err}
      
      response.result = "Success";
      emailUserProfile(msg, id);
    });
  }

  function emailUserProfile(msg, id) 
  {
    const emailAddress  = profile.email;
    const title         = `${sess.username} sent you a message | Cupid's Arrow`;
    const msg           = msgTemplates.report_account(profile.url);

    email.main(emailAddress, title, msg).catch(console.error);

    res.end(JSON.stringify(response));
  }
})