CREATE TABLE `permission_table` (
	`permissionId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`table` text NOT NULL,
	`action` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ROLE` (
	`roleId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ROLE_name_unique` ON `ROLE` (`name`);--> statement-breakpoint
CREATE TABLE `USER` (
	`userId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`contactNo` text NOT NULL,
	`address` text NOT NULL,
	`dateReg` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'customer' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `USER_email_unique` ON `USER` (`email`);