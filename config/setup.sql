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
	`valid` ENUM('T','F') NOT NULL DEFAULT 'F',
	`last_seen` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`last_modified` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`), 
	UNIQUE (`username`), 
	UNIQUE (`email`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`tokens` 
(
	`id` INT NOT NULL AUTO_INCREMENT ,
	`user_id` INT NOT NULL , 
	`token` VARCHAR(180) NOT NULL , 
	`request` ENUM('registration','verification','password_reset','email_reset','username_reset') NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`),
	UNIQUE (`token`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`likes`
(
	`id` INT NOT NULL ,
	`liker` INT NOT NULL ,
	`liked` INT NOT NULL ,
	`unliked` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`last_modified` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`locations`
(
	`id` INT NOT NULL AUTO_INCREMENT ,
	`location` GEOMETRY NOT NULL ,
	`street_address` VARCHAR(180) NOT NULL ,
	`area` VARCHAR(80) NOT NULL , 
	`state` VARCHAR(80) NOT NULL , 
	`country` VARCHAR(80) NOT NULL , 
	`user_id` INT NOT NULL , 
	`last_modified` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`tags` 
( 
	`id` INT NOT NULL AUTO_INCREMENT ,
	`name` VARCHAR(120) NOT NULL ,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ,
	PRIMARY KEY (`id`), 
	UNIQUE (`name`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`user_tags`
( 
	`id` INT NOT NULL AUTO_INCREMENT ,
	`user_id` INT NOT NULL , 
	`tag_id` INT NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`images` 
(
	`id` INT NOT NULL AUTO_INCREMENT , 
	`name` VARCHAR(120) NOT NULL , 
	`user_id` INT NOT NULL , 
	`profile_pic` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`) 
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`views` 
(
	`id` INT NOT NULL AUTO_INCREMENT ,
	`user_id` INT NOT NULL ,
	`viewer` INT NOT NULL ,
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`interests` 
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`name` VARCHAR(80) NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `matcha`.`user_interests` 
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`user_id` INT NOT NULL , 
	`interest_id` INT NOT NULL, 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`user_chat`
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`user_one` INT NOT NULL , 
	`user_two` INT NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`messages` 
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`chat_id` INT NOT NULL , 
	`user_id` INT NOT NULL , 
	`message` VARCHAR(4000) NOT NULL , 
	`viewed` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`fake_accounts` 
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`user_id` INT NOT NULL , 
	`validated` ENUM('T','F') NOT NULL , 
	`last_modified` TIMESTAMP on update CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`blocked_accounts` 
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`user_id` INT NOT NULL , 
	`blocked_user` INT NOT NULL , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`notifications` 	
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`user_id` INT NOT NULL , 
	`service_id` INT NOT NULL , 
	`type` ENUM('like','unlike','views') NOT NULL , 
	`viewed` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS  `matcha`.`chat_notifications` 	
( 
	`id` INT NOT NULL AUTO_INCREMENT , 
	`message_id` INT NOT NULL , 
	`user_id` INT NOT NULL , 
	`viewed` ENUM('T','F') NOT NULL DEFAULT 'F' , 
	`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	PRIMARY KEY (`id`)
) ENGINE = InnoDB;
