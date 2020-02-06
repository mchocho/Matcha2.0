CREATE DATABASE IF NOT EXISTS  matcha;

CREATE TABLE IF NOT EXISTS  `matcha`.`users` 				
(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
	`username` VARCHAR(30) NOT NULL ,
	`first_name` VARCHAR(120) NOT NULL ,
	`last_name` VARCHAR(120) NOT NULL ,
	`gender` ENUM('M','F') NOT NULL ,
	`preferences` ENUM('M','F','B') NOT NULL DEFAULT 'B' ,
	`DOB` DATE NOT NULL ,
	`email` VARCHAR(80) NOT NULL ,
	`password` VARCHAR(180) NOT NULL ,
	`biography` VARCHAR(4000) NOT NULL DEFAULT '',
	`rating` TINYINT NOT NULL DEFAULT '5' ,
	`notifications` ENUM('T','F') NOT NULL DEFAULT 'T' ,
	`verified` ENUM('T','F') NOT NULL  DEFAULT 'F',
	`online` ENUM('T','F') NOT NULL  DEFAULT 'F',
	`valid` ENUM('T','F') NOT NULL DEFAULT 'T',
	`last_seen` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_modified` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`), 
	UNIQUE (`username`), 
	UNIQUE (`email`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`tokens` 
(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
	`user_id` INT UNSIGNED NOT NULL , 
	`token` VARCHAR(180) DEFAULT NULL ,
	`new_password` VARCHAR(180) DEFAULT NULL , 
	`request` ENUM('registration','verification','password_reset','email_reset','username_reset') NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `tokens_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE,
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`likes`
(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
	`liker` INT UNSIGNED NOT NULL ,
	`liked` INT UNSIGNED NOT NULL ,
	`unliked` ENUM('T','F') NOT NULL DEFAULT 'F' ,
	`last_modified` TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	CONSTRAINT `liker_id_constraint`
	FOREIGN KEY (`liker`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
	ON UPDATE CASCADE,
		CONSTRAINT `liked_id_constraint`
		FOREIGN KEY (`liked`)
		REFERENCES `matcha`.`users` (`id`)
		ON DELETE CASCADE
	ON UPDATE CASCADE,
		PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`locations`
(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
	`lat` FLOAT( 10, 6 ) NOT NULL ,
	`lng` FLOAT( 10, 6 ) NOT NULL ,
	`street_address` VARCHAR(180) NOT NULL ,
	`area` VARCHAR(80) NOT NULL , 
	`state` VARCHAR(80) NOT NULL , 
	`country` VARCHAR(80) NOT NULL , 
	`user_id` INT UNSIGNED NOT NULL , 
	`last_modified` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `location_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE,
	PRIMARY KEY (`id`), 
	UNIQUE (`user_id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`tags` 
( 
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
	`name` VARCHAR(120) NOT NULL ,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	PRIMARY KEY (`id`) 
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`user_tags`
( 
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
	`user_id` INT UNSIGNED NOT NULL , 
	`tag_id` INT UNSIGNED NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `user_tags_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE,
	CONSTRAINT `tags_id_constraint`
	FOREIGN KEY (`tag_id`)
	REFERENCES `matcha`.`tags` (`id`),
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`images` 
(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT , 
	`name` VARCHAR(120) NOT NULL , 
	`user_id` INT UNSIGNED NOT NULL , 
	`profile_pic` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `images_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE ,
	PRIMARY KEY (`id`) 
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`views` 
(
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
	`user_id` INT UNSIGNED NOT NULL ,
	`viewer` INT UNSIGNED NOT NULL,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `veiwed_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE ,
	CONSTRAINT `veiwer_id_constraint`
	FOREIGN KEY (`viewer`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE ,
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`user_chat`
( 
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT , 
	`user_one` INT UNSIGNED NOT NULL , 
	`user_two` INT UNSIGNED NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`),
	CONSTRAINT `user_one_id_constraint`
	FOREIGN KEY (`user_one`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE ,
	CONSTRAINT `user_two_id_constraint`
	FOREIGN KEY (`user_two`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`messages` 
( 
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT , 
	`chat_id` INT UNSIGNED NOT NULL , 
	`user_id` INT UNSIGNED NOT NULL , 
	`message` VARCHAR(4000) NOT NULL , 
	`viewed` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `chat_id_constraint`
	FOREIGN KEY (`chat_id`)
	REFERENCES `matcha`.`user_chat` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE ,
	CONSTRAINT `mess_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE ,
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`blocked_accounts` 
( 
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT , 
	`user_id` INT UNSIGNED NOT NULL , 
	`blocked_user` INT UNSIGNED NOT NULL, 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `blocker_user_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE,
	CONSTRAINT `blocked_user_id_constraint`
	FOREIGN KEY (`blocked_user`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE,
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`notifications` 	
( 
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT , 
	`user_id` INT UNSIGNED NOT NULL , 
	`service_id` INT UNSIGNED NOT NULL , 
	`type` ENUM('like','unlike','views','block') NOT NULL , 
	`viewed` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	CONSTRAINT `notif_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE ,
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`chat_notifications` 	
( 
	`id` INT UNSIGNED NOT NULL AUTO_INCREMENT , 
	`message_id` INT UNSIGNED NOT NULL  , 
	`user_id` INT UNSIGNED NOT NULL  , 
	`viewed` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	CONSTRAINT `chat_notif_id_constraint`
	FOREIGN KEY (`message_id`)
	REFERENCES `matcha`.`messages` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE , 
	CONSTRAINT `user_chat_notif_id_constraint`
	FOREIGN KEY (`user_id`)
	REFERENCES `matcha`.`users` (`id`)
	ON DELETE CASCADE
  ON UPDATE CASCADE , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB