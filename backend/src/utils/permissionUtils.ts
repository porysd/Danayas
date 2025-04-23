import db from "../config/database";
import { and, eq } from "drizzle-orm";
import { PermissionsTable } from "../schemas/Permission";
import { UsersTable } from "../schemas/User";
import { NotFoundError } from "./errors";

export enum Roles {
  ADMIN = "admin",
  STAFF = "staff",
  CUSTOMER = "customer",
}

export const permissionsArray = ["create", "read", "update", "delete"] as const;

export async function verifyPermission(
  userId: number,
  table: string,
  action: typeof permissionsArray[number],
) {
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.userId, userId),
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.role === Roles.ADMIN) {
    return true;
  }

  if(user.role === Roles.STAFF) {
    if(["create", "read", "update"].includes(action)){
      return true;
    } else {
      return false;
    }
  }

  if(user.role === Roles.CUSTOMER){
    if(action === "read"){
      return true;
    } else{
      return false;
    }
  }

  const permissionRecord = await db.query.PermissionsTable.findFirst({
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
    await db.insert(PermissionsTable).values({
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
    await db.delete(PermissionsTable).where(
      and(
        eq(PermissionsTable.userId, userId),
        eq(PermissionsTable.table, table),
        eq(PermissionsTable.action, action),
      ),
    ).execute();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
