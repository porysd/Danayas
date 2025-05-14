CREATE TABLE `TermsAndCondition` (
	`TermsAndConditionId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`Content` text NOT NULL,
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updateAt` text DEFAULT (current_timestamp) NOT NULL
);
