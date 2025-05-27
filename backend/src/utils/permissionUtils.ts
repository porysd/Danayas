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

export const permissionsArray = ["create", "read", "update", "delete", "overrideAmount"] as const;

const rolePermissions: Record<Roles, Record<string, string[]>> = {
  [Roles.ADMIN]: {
    "*": ["create", "read", "update", "delete", "overrideAmount"], // Full access to all modules
  },

  [Roles.STAFF]: {
    USER: ["create", "read", "update"],
    BOOKING: ["create", "read", "update"],
    PAYMENT: ["create", "read", "update"],
    PACKAGES: ["create", "read", "update"],
    DISCOUNTS: ["create", "read", "update"],
    REFUND: ["create", "read", "update"],
    REFUND_PAYMENT: ["read"],
    BOOKING_ADD_ONS: ["create", "read", "update"],
    CATALOG_ADD_ONS: ["create", "read", "update"],
    FAQS: ["read", "update"],
    TERMS_AND_CONDITION: ["read", "update"],
    AUDIT_LOGS: ["read"],
    PUBLIC_ENTRY: ["create", "read", "update"],
    PUBLIC_ENTRY_RATE: ["create", "read", "update"],
    PUBLIC_ENTRY_ADD_ONS: ["create", "read", "update"],
    BLOCKED_DATES: ["create", "read", "update"],
  },

  [Roles.CUSTOMER]: {
    USER: ["read", "update"], // their own profile
    BOOKING: ["create", "read", "update"], // their own booking
    PAYMENT: ["create", "read"], // their own payment
    PACKAGES: ["read"],
    DISCOUNTS: ["read"],
    REFUND: ["read"], // their own refund
    BOOKING_ADD_ONS: ["read"],
    CATALOG_ADD_ONS: ["read"],
    FAQS: ["read"],
    TERMS_AND_CONDITION: ["read"],
    PUBLIC_ENTRY: ["create", "read"],
    PUBLIC_ENTRY_RATE: ["read"],
    PUBLIC_ENTRY_ADD_ONS: ["read"],
    BLOCKED_DATES: ["read"],
  },
};

export async function verifyPermission(
  userId: number,
  table: string,
  action: (typeof permissionsArray)[number]
) {
  const user = await db.query.UsersTable.findFirst({
    where: eq(UsersTable.userId, userId),
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const roleBased = rolePermissions[user.role];

  if (roleBased) {
    const allowedActions = roleBased[table] || roleBased["*"];
    if (allowedActions?.includes(action)) return true;
  }

  if (!roleBased) {
    throw new Error(`Access denied: Unrecognized role "${user.role}"`);
  }

  const permissionRecord = await db.query.PermissionsTable.findFirst({
    where: (fields, operators) =>
      operators.and(
        eq(fields.userId, userId),
        eq(fields.table, table),
        eq(fields.action, action)
      ),
  });

  return !!permissionRecord;
}

export async function grantPermission(
  userId: number,
  table: string,
  action: (typeof permissionsArray)[number]
) {
  try {
    await db
      .insert(PermissionsTable)
      .values({
        userId,
        table,
        action,
      })
      .execute();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function revokePermission(
  userId: number,
  table: string,
  action: (typeof permissionsArray)[number]
) {
  try {
    await db
      .delete(PermissionsTable)
      .where(
        and(
          eq(PermissionsTable.userId, userId),
          eq(PermissionsTable.table, table),
          eq(PermissionsTable.action, action)
        )
      )
      .execute();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// import db from "../config/database";
// import { and, eq } from "drizzle-orm";
// import { PermissionsTable } from "../schemas/Permission";
// import { UsersTable } from "../schemas/User";
// import { NotFoundError } from "./errors";

// export enum Roles {
//   ADMIN = "admin",
//   STAFF = "staff",
//   CUSTOMER = "customer",
// }

// export const permissionsArray = ["create", "read", "update", "delete"] as const;

// export async function verifyPermission(
//   userId: number,
//   table: string,
//   action: typeof permissionsArray[number],
// ) {
//   const user = await db.query.UsersTable.findFirst({
//     where: eq(UsersTable.userId, userId),
//   });

//   if (!user) {
//     throw new NotFoundError("User not found");
//   }

//   if (user.role === Roles.ADMIN) {
//     return true;
//   }

//   if(user.role === Roles.STAFF) {
//     if(["create", "read", "update"].includes(action)){
//       return true;
//     } else {
//       return false;
//     }
//   }

//   if(user.role === Roles.CUSTOMER){
//     if(["create", "read", "update"].includes(action)){
//       return true;
//     } else{
//       return false;
//     }
//   }

//   const permissionRecord = await db.query.PermissionsTable.findFirst({
//     where: (fields, operators) =>
//       operators.and(
//         eq(fields.userId, userId),
//         eq(fields.table, table),
//         eq(fields.action, action),
//       ),
//   });

//   return !!permissionRecord;
// }

// export async function grantPermission(
//   userId: number,
//   table: string,
//   action: typeof permissionsArray[number],
// ) {
//   try {
//     await db.insert(PermissionsTable).values({
//       userId,
//       table,
//       action,
//     }).execute();
//     return true;
//   } catch (e) {
//     console.error(e);
//     return false;
//   }
// }

// export async function revokePermission(
//   userId: number,
//   table: string,
//   action: typeof permissionsArray[number],
// ) {
//   try {
//     await db.delete(PermissionsTable).where(
//       and(
//         eq(PermissionsTable.userId, userId),
//         eq(PermissionsTable.table, table),
//         eq(PermissionsTable.action, action),
//       ),
//     ).execute();
//     return true;
//   } catch (e) {
//     console.error(e);
//     return false;
//   }
// }
