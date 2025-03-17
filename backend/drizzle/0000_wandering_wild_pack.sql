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
CREATE UNIQUE INDEX `USER_email_unique` ON `USER` (`email`);--> statement-breakpoint
CREATE TABLE `ROLE` (
	`roleId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ROLE_name_unique` ON `ROLE` (`name`);--> statement-breakpoint
CREATE TABLE `BOOKING` (
	`bookingId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`createdBy` integer,
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
	`discountPromoId` integer,
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
CREATE TABLE `PAYMENT` (
	`paymentId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer NOT NULL,
	`discountAmount` real,
	`downpaymentAmount` real,
	`amountPaid` real NOT NULL,
	`totalAmountDue` real NOT NULL,
	`mode` text NOT NULL,
	`reference` text,
	`paymentStatus` text NOT NULL,
	`paidAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "modeCheck" CHECK("PAYMENT"."mode" in ('gcash', 'cash')),
	CONSTRAINT "paymentStatusCheck" CHECK("PAYMENT"."paymentStatus" in ('pending', 'partially_paid', 'paid', 'failed'))
);
--> statement-breakpoint
CREATE TABLE `BILLING` (
	`billingId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer NOT NULL,
	`paymentId` integer,
	`totalAmount` real NOT NULL,
	`status` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paymentId`) REFERENCES `PAYMENT`(`paymentId`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "statusCheck" CHECK("BILLING"."status" in ('Unpaid', 'Partially Paid', 'Paid'))
);
--> statement-breakpoint
CREATE TABLE `REPORTS` (
	`reportId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`generatedBy` integer NOT NULL,
	`reportType` text NOT NULL,
	`bookingId` integer,
	`paymentId` integer,
	`totalRevenue` real,
	`filterType` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`generatedBy`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paymentId`) REFERENCES `PAYMENT`(`paymentId`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `DISCOUNT_PROMOS` (
	`discountPromoId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`percentage` real NOT NULL,
	`type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `BOOKING_ADD_ONS` (
	`addOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer NOT NULL,
	`itemName` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`totalPrice` real NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `CONTENT_MANAGEMENT` (
	`contentId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`imageUrl` text,
	`managedBy` integer NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`managedBy`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "categoryCheck" CHECK("CONTENT_MANAGEMENT"."category" in ('FAQ', 'Gallery', 'Landing Page', 'Terms and Conditions', 'About Us'))
);
--> statement-breakpoint
CREATE TABLE `PERMISSION` (
	`permissionId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`table` text NOT NULL,
	`action` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action
);
