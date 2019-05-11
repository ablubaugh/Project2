/*Create and use database murderboat_db
*/
DROP DATABASE IF EXISTS murderboat_db;
CREATE DATABASE murderboat_db;
USE murderboat_db;

/*Create Users table to hold all user info input*/
CREATE TABLE `Users` (
	`id` INTEGER AUTO_INCREMENT NOT NULL,
	`firstName` VARCHAR(50) NOT NULL,
	`lastName` VARCHAR(50) NOT NULL,
	`nickName` VARCHAR(50),
	`phone` VARCHAR(10) NOT NULL,
	`email` VARCHAR(100) NOT NULL,
    `skills` VARCHAR(5000),
    `password` CHAR(60) NOT NULL,
    `verifiedNumber` BOOLEAN NOT NULL default 0,

	/* Set ID as primary key */
	PRIMARY KEY (`id`)
);

/*Create Events table*/
CREATE TABLE `Events` (
	`id` INTEGER AUTO_INCREMENT NOT NULL,
	`name` VARCHAR (100) NOT NULL,
	`description` VARCHAR(5000),
	`venue` VARCHAR (250),
	`startTime` DATETIME,
	`endTime` DATETIME,
   
	/* Set ID as primary key */
	PRIMARY KEY (`id`)

);
/*Create shift table*/
CREATE TABLE `Shifts` (
	`id` INTEGER AUTO_INCREMENT NOT NULL,
    `eventID` INTEGER,
	`position` VARCHAR(50) NOT NULL,
	`startTime` DATETIME,
	`endTime` DATETIME,
	/* Set ID as primary key */
	PRIMARY KEY (`id`),

    FOREIGN KEY (`eventID`)
    REFERENCES Events (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE

);


/*Create relational fk table*/
CREATE TABLE `User_Shifts` (
	`id` INTEGER AUTO_INCREMENT NOT NULL,
	`userID` INTEGER,
  `shiftID` INTEGER NOT NULL,
  `checkedIn` BOOLEAN default 0,
  `checkedOut` BOOLEAN default 0,


	PRIMARY KEY (`id`),

	/* Set Foreign Keys*/
    FOREIGN KEY (`userID`)
    REFERENCES Users (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

    FOREIGN KEY (`shiftID`)
    REFERENCES Shifts (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);