// ************************************************************************** //
//                                                                            //
//                                                        :::      ::::::::   //
//   test_notifications.js                              :+:      :+:    :+:   //
//                                                    +:+ +:+         +:+     //
//   By: mchocho <marvin@42.fr>                     +#+  +:+       +#+        //
//                                                +#+#+#+#+#+   +#+           //
//   Created: 2020/02/03 16:19:41 by mchocho           #+#    #+#             //
//   Updated: 2020/02/03 17:18:14 by mchocho          ###   ########.fr       //
//                                                                            //
// ************************************************************************** //

const ft_util           = require('../includes/ft_util.js'),
          dbc                   = require('../model/sql_connect.js'),
          sql                   = require('../model/sql_statements.js');


ft_util.getUserNotifications(dbc, 1).then(results => {
	console.log('Notification results:\n', results);
	process.exit();
}).catch(err => { console.log(err); process.exit();});
