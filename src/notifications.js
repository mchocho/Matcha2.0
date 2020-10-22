const express 		= require("express");
const session	    = require("express-session");

const dbc			= require("../model/sql_connect.js");
const sql			= require("../model/sql_statements.js");
const ft_util		= require("../includes/ft_util.js");

const router 		= express.Router();

module.exports 		= router;

router.get("/", (req, res) =>
{
	const sess 		= req.session.user;

	if (!ft_util.isobject(sess))
	{
		res.redirect("/logout");
		return;
	}
	else if (sess.verified !== "T")
	{
		res.redirect("/verify_email");
		return;
	}
	else if (sess.valid !== "T")
	{
		res.redirect("/reported_account");
		return;
	}

	const id 		= sess.id;

	getUserNotifications();

	function getUserNotifications()
	{
		dbc.query(sql.selUserNotifications, [id], (err, notifications) =>
		{
			if (err) {throw err}

			if (notifications.length === 0)
			{
				fetchUserNavElements([]);
				return;
			}			
			listAllNotifications(notifications);
		});
	}

	function listAllNotifications(notifications)
	{
		result.forEach((notification, i , arr) =>
		{
			const selValues = [notification.service_id];
			const type 		= notification.type;

			if (type === "views")
				query = sql.selUserView;
			else if (type === "block")
				query = sql.selBlockedUserById;
			else
				query = sql.selUserLike;

			dbc.query(query, selValues, (err, result) =>
			{
				if (err) {throw err}

				handleNotificationType(notifications, i, result);
			});
		});
	}

	function handleNotificationType(notifications, i, result)
	{
		let user;

		if (type === "views")
			user = result[0]["viewer"];
		else if (type === "block")
			user = result[0]["blocked_user"];
		else
			user = result[0]["liker"];

		getUserDetails(notifications, i, user);
	}

	function getUserDetails(notifications, i, user)
	{
		dbc.query(sql.selUserById, [user], (err, result) =>
		{
			if (err) {throw err}

			const source = result[0];

			notifications[i].source = source;
			getConnectionStatus(notifications, i, source);
		});
	}

	function getConnectionStatus(notifications, i, user)
	{
		const selValues 	= [sess.id, user.id, user.id, sess.id];
		const status 		= {
			userLikesYou	: false,
			youLikeUser		: false
		};

		dbc.query(sql.getConnectionStatus, selValues, (err, result) =>
		{
			if (err) {throw err}

			[...result].forEach(status =>
			{
				(status.liker === user.id) ? status.userLikesYou = true : status.youLikeUser = true;
			});

			Object.assign(notifications[i], status);


			if (i === notifications.length - 1)
				markAllNotificationsAsViewed(notifications);
		});
	}

	function markAllNotificationsAsViewed(notifications)
	{
		dbc.query(sql.updateUserNotifications, [sess.id], (err, result) =>
		{
			if (err) {throw err}

			fetchUserNavElements(notifications);
		});
	}

	function fetchUserNavElements(notifications)
	{		
		(async () =>
		{
			try {
				const notificationsAvalilable 	= await ft_util.userNotificationStatus(dbc, sess.id);
				const images 					= await ft_util.getUserImages(dbc, sess.id);

				renderNotifications(notifications, notificationsAvalilable, images[0]);
			}
			catch(e) {
				if (ft_util.VERBOSE)
					console.log("Failed to fetch user images: ", e);
				throw e;
			}
		})();
	}

	function renderNotifications(notifications, notificationsAvalilable, images)
	{
		const renderOptions 	= {
			title				: "Your Notifications | Cupid's Arrow",
			userNotifications 	: notifications.reverse(),
			notifications 		: notificationsAvalilable.notifications,
			chats				: notificationsAvalilable.chats,
			profile_pic			: images
		};

		res.render("notifications.pug", renderOptions);
	}
});
