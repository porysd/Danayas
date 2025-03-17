import db from "../config/database";
import { and, eq } from "drizzle-orm";
import { permissionTable } from "../schemas/Permission";

export enum Roles {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

export const permissionsArray = ["create", "read", "update", "delete"] as const;

export async function verifyPermission(
  userId: number,
  table: string,
  action: typeof permissionsArray[number],
) {
  const permissionRecord = await db.query.permissionTable.findFirst({
    where: (fields, operators) =>
      operators.and(
        eq(fields.userId, userId),
        eq(fields.table, table),
        eq(fields.action, action),
      ),
  });

  return !!permissionRecord;
}

export async function grantPermission(
  userId: number,
  table: string,
  action: typeof permissionsArray[number],
) {
  try {
    await db.insert(permissionTable).values({
      userId,
      table,
      action,
    }).execute();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function revokePermission(
  userId: number,
  table: string,
  action: typeof permissionsArray[number],
) {
  try {
    await db.delete(permissionTable).where(
      and(
        eq(permissionTable.userId, userId),
        eq(permissionTable.table, table),
        eq(permissionTable.action, action),
      ),
    ).execute();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
