import { makeError } from "../utils/errors";

export function handleCronError(error: unknown) {
  const { error: errObj } = makeError(
    error instanceof Error
      ? error
      : new Error("Unknown error occurred in cron job")
  );
  console.error(`[CRON ERROR] ${errObj.name}: ${errObj.message}`, error);
}
