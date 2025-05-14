ALTER TABLE `DISCOUNTS` RENAME COLUMN "type" TO "typeFor";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_BOOKING_ADD_ONS` (
	`bookingAddOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bookingId` integer NOT NULL,
	`catalogAddOnId` integer NOT NULL,
	`price` real NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`bookingId`) REFERENCES `BOOKING`(`bookingId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`catalogAddOnId`) REFERENCES `CATALOG_ADD_ONS`(`CatalogAddOnId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_BOOKING_ADD_ONS`("bookingAddOnId", "bookingId", "catalogAddOnId", "price", "createdAt") SELECT "bookingAddOnId", "bookingId", "catalogAddOnId", "price", "createdAt" FROM `BOOKING_ADD_ONS`;--> statement-breakpoint
DROP TABLE `BOOKING_ADD_ONS`;--> statement-breakpoint
ALTER TABLE `__new_BOOKING_ADD_ONS` RENAME TO `BOOKING_ADD_ONS`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_CATALOG_ADD_ONS` (
	`CatalogAddOnId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`itemName` text NOT NULL,
	`price` real NOT NULL,
	`status` text NOT NULL,
	`createdAt` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_CATALOG_ADD_ONS`("CatalogAddOnId", "itemName", "price", "status", "createdAt") SELECT "CatalogAddOnId", "itemName", "price", "status", "createdAt" FROM `CATALOG_ADD_ONS`;--> statement-breakpoint
DROP TABLE `CATALOG_ADD_ONS`;--> statement-breakpoint
ALTER TABLE `__new_CATALOG_ADD_ONS` RENAME TO `CATALOG_ADD_ONS`;