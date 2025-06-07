CREATE TABLE `VERIFICATION` (
	`verificationId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`tokenHashed` text NOT NULL,
	`tokenType` text NOT NULL,
	`isUsed` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`expiresAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_USER` (
	`userId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`contactNo` text NOT NULL,
	`address` text NOT NULL,
	`dateReg` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`pin` text,
	`role` text DEFAULT 'customer' NOT NULL,
	`isVerified` integer DEFAULT 0
);
--> statement-breakpoint
INSERT INTO `__new_USER`("userId", "username", "firstName", "lastName", "contactNo", "address", "dateReg", "status", "email", "password", "pin", "role", "isVerified") SELECT "userId", "username", "firstName", "lastName", "contactNo", "address", "dateReg", "status", "email", "password", "pin", "role", "isVerified" FROM `USER`;--> statement-breakpoint
DROP TABLE `USER`;--> statement-breakpoint
ALTER TABLE `__new_USER` RENAME TO `USER`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `USER_email_unique` ON `USER` (`email`);