CREATE TABLE `AUDIT_LOGS` (
	`auditLogId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`action` text NOT NULL,
	`tableName` text NOT NULL,
	`recordId` integer NOT NULL,
	`data` text,
	`remarks` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BLOCKED_DATES` (
	`blockedDatesId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`blockedDates` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`others` text,
	`createdBy` integer NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`createdBy`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BOOKING_ADD_ONS` (
	`bookingAddOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer NOT NULL,
	`catalogAddOnId` integer NOT NULL,
	`price` real NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`catalogAddOnId`) REFERENCES `CATALOG_ADD_ONS`(`CatalogAddOnId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `BOOKING` (
	`bookingId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`packageId` integer NOT NULL,
	`discountId` integer,
	`bookStatus` text DEFAULT 'pending',
	`checkInDate` text NOT NULL,
	`checkOutDate` text NOT NULL,
	`mode` text NOT NULL,
	`reservationType` text NOT NULL,
	`eventType` text,
	`numberOfGuest` integer,
	`arrivalTime` text,
	`catering` integer,
	`paymentTerms` text NOT NULL,
	`bookingPaymentStatus` text DEFAULT 'unpaid' NOT NULL,
	`totalAmount` real NOT NULL,
	`amountPaid` real NOT NULL,
	`remainingBalance` real NOT NULL,
	`cancelCategory` text,
	`cancelReason` text,
	`firstName` text,
	`lastName` text,
	`contactNo` text,
	`emailAddress` text,
	`address` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`forfeited` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`packageId`) REFERENCES `PACKAGES`(`packageId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discountId`) REFERENCES `DISCOUNTS`(`discountId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `CATALOG_ADD_ONS` (
	`CatalogAddOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`itemName` text NOT NULL,
	`price` real NOT NULL,
	`status` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `DISCOUNTS` (
	`discountId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`percentage` real NOT NULL,
	`typeFor` text NOT NULL,
	`status` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `FAQS` (
	`faqsId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Question` text NOT NULL,
	`Answer` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PACKAGES` (
	`packageId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`imageUrl` text,
	`price` real NOT NULL,
	`inclusion` text NOT NULL,
	`status` text NOT NULL,
	`mode` text NOT NULL,
	`isPromo` integer DEFAULT false NOT NULL,
	`maxPax` integer NOT NULL,
	`promoStart` text,
	`promoEnd` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PAYMENT` (
	`paymentId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer,
	`publicEntryId` integer,
	`verifiedBy` integer,
	`mode` text NOT NULL,
	`amount` real NOT NULL,
	`changeAmount` real DEFAULT 0 NOT NULL,
	`netPaidAmount` real NOT NULL,
	`senderName` text NOT NULL,
	`reference` text,
	`imageUrl` text,
	`paymentStatus` text DEFAULT 'pending' NOT NULL,
	`remarks` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`publicEntryId`) REFERENCES `PUBLIC_ENTRY`(`publicEntryId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verifiedBy`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `PUBLIC_ENTRY_ADD_ONS` (
	`publicAddOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`publicEntryId` integer NOT NULL,
	`catalogAddOnId` integer NOT NULL,
	`price` real NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`publicEntryId`) REFERENCES `PUBLIC_ENTRY`(`publicEntryId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`catalogAddOnId`) REFERENCES `CATALOG_ADD_ONS`(`CatalogAddOnId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `PUBLIC_ENTRY_RATE` (
	`rateId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rate` real NOT NULL,
	`category` text NOT NULL,
	`mode` text NOT NULL,
	`isActive` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `PUBLIC_ENTRY` (
	`publicEntryId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`discountId` integer,
	`firstName` text,
	`lastName` text,
	`contactNo` text,
	`address` text,
	`entryDate` text NOT NULL,
	`mode` text NOT NULL,
	`reservationType` text NOT NULL,
	`numAdults` integer NOT NULL,
	`numKids` integer NOT NULL,
	`adultGuestNames` text NOT NULL,
	`kidGuestNames` text NOT NULL,
	`status` text DEFAULT 'pending',
	`adultRateId` integer NOT NULL,
	`kidRateId` integer NOT NULL,
	`totalAmount` real NOT NULL,
	`amountPaid` real NOT NULL,
	`remainingBalance` real NOT NULL,
	`publicPaymentStatus` text DEFAULT 'unpaid' NOT NULL,
	`paymentTerms` text NOT NULL,
	`cancelCategory` text,
	`cancelReason` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`discountId`) REFERENCES `DISCOUNTS`(`discountId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`adultRateId`) REFERENCES `PUBLIC_ENTRY_RATE`(`rateId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kidRateId`) REFERENCES `PUBLIC_ENTRY_RATE`(`rateId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `REFUND_PAYMENT` (
	`refundPaymentId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`refundId` integer NOT NULL,
	`paymentId` integer NOT NULL,
	`amountRefunded` real NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`refundId`) REFERENCES `REFUND`(`refundId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paymentId`) REFERENCES `PAYMENT`(`paymentId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `REFUND` (
	`refundId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer,
	`publicEntryId` integer,
	`verifiedBy` integer,
	`mode` text,
	`amount` real NOT NULL,
	`refundStatus` text DEFAULT 'pending' NOT NULL,
	`refundReason` text NOT NULL,
	`refundType` text NOT NULL,
	`senderName` text,
	`reference` text,
	`imageUrl` text,
	`receiveName` text,
	`acknowledge` text,
	`acknowledgeAt` text,
	`remarks` text,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`publicEntryId`) REFERENCES `PUBLIC_ENTRY`(`publicEntryId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verifiedBy`) REFERENCES `USER`(`userId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ROLE` (
	`roleId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ROLE_name_unique` ON `ROLE` (`name`);--> statement-breakpoint
CREATE TABLE `TERMS_AND_CONDITION` (
	`termsId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updatedAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
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
	`pin` text,
	`role` text DEFAULT 'customer' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `USER_email_unique` ON `USER` (`email`);