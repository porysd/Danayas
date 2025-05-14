ALTER TABLE `TermsAndCondition` RENAME TO `TERMS_AND_CONDITION`;--> statement-breakpoint
ALTER TABLE `TERMS_AND_CONDITION` RENAME COLUMN "TermsAndConditionId" TO "termsId";--> statement-breakpoint
ALTER TABLE `TERMS_AND_CONDITION` RENAME COLUMN "Content" TO "content";