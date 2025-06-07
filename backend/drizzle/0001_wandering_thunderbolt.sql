ALTER TABLE `USER` ADD `isVerified` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `BOOKING` DROP COLUMN `hasRescheduled`;