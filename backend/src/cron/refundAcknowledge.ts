import cron from "node-cron";
import { db } from "../config/database";
import { eq, and, lt, isNull } from "drizzle-orm";
import { RefundsTable } from "../schemas/schema";
import { handleCronError } from "../utils/cronErrorHandler";

export const autoAcknowledgeNoResponseJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[CRON] Checking for refund acknowledge...");

      const now = new Date();
      const cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 7);

      //Automatic 7 days if date exceed and no input of 'yes' or 'no', then do automatic "auto" acknowledge.
      const refundAcknowledge = await db
        .select()
        .from(RefundsTable)
        .where(
          and(
            lt(RefundsTable.createdAt, cutoffDate.toISOString()),
            isNull(RefundsTable.acknowledge)
          )
        );

      for (const acknowledge of refundAcknowledge) {
        await db
          .update(RefundsTable)
          .set({ acknowledge: "auto", acknowledgeAt: new Date().toISOString() })
          .where(eq(RefundsTable.refundId, acknowledge.refundId));

        console.log(
          `[CRON] Auto-acknowledge refund ID: ${acknowledge.refundId} after 7 days of no response.`
        );
      }
    } catch (error) {
      handleCronError(error);
    }
  });
};

export const autoAcknowledgeNoChoiceJob = () => {
  cron.schedule("0 0 * * *", async () => {
    //second, minute, hour, date in month, month, day in a week
    try {
      console.log(
        "[CRON] Checking for refunds with 'no' acknowledge past 7 days..."
      );

      //Automatic 7 days if client choose "no" and exceeds the date, then do automatic "yes" acknowledge.
      const now = new Date();
      const cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 7);

      const refundAcknowledge = await db
        .select()
        .from(RefundsTable)
        .where(
          and(
            eq(RefundsTable.acknowledge, "no"),
            lt(RefundsTable.acknowledgeAt, cutoffDate.toISOString())
          )
        );

      for (const acknowledge of refundAcknowledge) {
        await db
          .update(RefundsTable)
          .set({ acknowledge: "yes", acknowledgeAt: new Date().toISOString() })
          .where(eq(RefundsTable.refundId, acknowledge.refundId));

        console.log(
          `[CRON] Auto-changed acknowledge from "no" to "yes" for refund ID: ${acknowledge.refundId} after 7 days.`
        );
      }
    } catch (error) {
      handleCronError(error);
    }
  });
};
