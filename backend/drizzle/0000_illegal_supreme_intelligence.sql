CREATE TABLE `billing` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`total` real NOT NULL,
	`issuer` text NOT NULL,
	`cashierId` integer,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cashierId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "issuerCheck" CHECK("billing"."issuer" in ("System", "Receptionist"))
);
--> statement-breakpoint
CREATE TABLE `billing_schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`billingId` integer NOT NULL,
	`scheduleId` integer NOT NULL,
	FOREIGN KEY (`billingId`) REFERENCES `billing`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scheduleId`) REFERENCES `schedule`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`isDiscount` integer NOT NULL,
	`discountAmount` real DEFAULT 0,
	`description` text,
	CONSTRAINT "discountCheck" CHECK("packages"."isDiscount" in (0, 1))
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`amount` real NOT NULL,
	`isDiscount` integer NOT NULL,
	`packageId` integer,
	`mode` text NOT NULL,
	`reference` text,
	`status` text NOT NULL,
	`downpaymentAmount` real,
	`time` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "discountCheck" CHECK("payment"."isDiscount" in (0, 1)),
	CONSTRAINT "modeCheck" CHECK("payment"."mode" in ("gcash", "cash")),
	CONSTRAINT "statusCheck" CHECK("payment"."status" in ("pending", "in progress", "done"))
);
--> statement-breakpoint
CREATE TABLE `role` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `role_name_unique` ON `role` (`name`);--> statement-breakpoint
CREATE TABLE `schedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`mode` text NOT NULL,
	`startDate` text NOT NULL,
	`endDate` text NOT NULL,
	`packageId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "modeCheck" CHECK("schedule"."mode" in ("day", "night"))
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`contactNo` text NOT NULL,
	`address` text NOT NULL,
	`dateReg` text NOT NULL,
	`status` integer NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`roleId` integer NOT NULL,
	FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "statusCheck" CHECK("user"."status" in (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);