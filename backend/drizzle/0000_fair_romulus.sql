CREATE TABLE `BILLING` (
	`billingId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`paymentId` integer NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`paymentId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BOOKING_ADD_ONS` (
	`addOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer NOT NULL,
	`price` real NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bookingId`) REFERENCES `CATALOG_ADD_ONS`(`addOnId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BOOKING` (
	`bookingId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`checkInDate` text NOT NULL,
	`checkOutDate` text NOT NULL,
	`mode` text NOT NULL,
	`packageId` integer NOT NULL,
	`firstName` text,
	`lastName` text,
	`arrivalTime` text NOT NULL,
	`eventType` text NOT NULL,
	`numberOfGuest` integer NOT NULL,
	`catering` integer NOT NULL,
	`contactNo` text,
	`emailAddress` text,
	`address` text,
	`discountId` integer,
	`paymentTerms` text NOT NULL,
	`totalAmountDue` real NOT NULL,
	`bookStatus` text NOT NULL,
	`reservationType` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`packageId`) REFERENCES `PACKAGES`(`packageId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discountId`) REFERENCES `DISCOUNTS`(`discountId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `CATALOG_ADD_ONS` (
	`addOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`itemName` text NOT NULL,
	`totalPrice` real NOT NULL,
	`status` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `DISCOUNTS` (
	`discountId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`percentage` real NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PACKAGES` (
	`packageId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`imageUrl` text,
	`price` real NOT NULL,
	`inclusion` text NOT NULL,
	`status` text NOT NULL,
	`mode` text,
	`isPromo` integer DEFAULT 0 NOT NULL,
	`promoStart` text,
	`promoEnd` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PAYMENT` (
	`paymentId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer NOT NULL,
	`imageUrl` text,
	`downPaymentAmount` real,
	`amountPaid` real NOT NULL,
	`remainingBalance` real NOT NULL,
	`mode` text NOT NULL,
	`reference` text,
	`senderName` text NOT NULL,
	`refundAmount` real,
	`paymentStatus` text NOT NULL,
	`refundStatus` text DEFAULT 'none' NOT NULL,
	`paidAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action
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
	`username` text NOT NULL,
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