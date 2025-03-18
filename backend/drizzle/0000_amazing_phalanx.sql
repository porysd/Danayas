CREATE TABLE `BOOKING` (
	`bookingId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`createdBy` integer NOT NULL,
	`checkInDate` text NOT NULL,
	`checkOutDate` text NOT NULL,
	`mode` text NOT NULL,
	`packageId` integer NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`arrivalTime` text NOT NULL,
	`eventType` text NOT NULL,
	`numberOfGuest` integer NOT NULL,
	`catering` integer NOT NULL,
	`contactNo` text NOT NULL,
	`emailAddress` text NOT NULL,
	`address` text NOT NULL,
	`discountPromoId` integer NOT NULL,
	`paymentTerms` text NOT NULL,
	`totalAmountDue` real NOT NULL,
	`bookStatus` text NOT NULL,
	`reservationType` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`createdBy`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`packageId`) REFERENCES `PACKAGES`(`packageId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discountPromoId`) REFERENCES `DISCOUNT_PROMOS`(`discountPromoId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `DISCOUNT_PROMOS` (
	`discountPromoId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`percentage` real NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PACKAGES` (
	`packageId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
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