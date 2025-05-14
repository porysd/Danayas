PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_PAYMENT` (
	`paymentId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transactionId` integer NOT NULL,
	`imageUrl` text,
	`downPaymentAmount` real,
	`amountPaid` real NOT NULL,
	`category` text NOT NULL,
	`mode` text NOT NULL,
	`reference` text,
	`senderName` text NOT NULL,
	`paymentStatus` text DEFAULT 'valid' NOT NULL,
	`paidAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`transactionId`) REFERENCES `TRANSACTION`(`transactionId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_PAYMENT`("paymentId", "transactionId", "imageUrl", "downPaymentAmount", "amountPaid", "category", "mode", "reference", "senderName", "paymentStatus", "paidAt") SELECT "paymentId", "transactionId", "imageUrl", "downPaymentAmount", "amountPaid", "category", "mode", "reference", "senderName", "paymentStatus", "paidAt" FROM `PAYMENT`;--> statement-breakpoint
DROP TABLE `PAYMENT`;--> statement-breakpoint
ALTER TABLE `__new_PAYMENT` RENAME TO `PAYMENT`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `BOOKING` ADD `cancelReason` text;--> statement-breakpoint
ALTER TABLE `BOOKING` ADD `cancelCategory` text;--> statement-breakpoint
ALTER TABLE `BOOKING` ADD `hasRescheduled` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `TRANSACTION` ADD `transactionStatus` text NOT NULL;--> statement-breakpoint
ALTER TABLE `TRANSACTION` ADD `refundStatus` text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `TRANSACTION` ADD `remainingBalance` real NOT NULL;