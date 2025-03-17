import { z } from "@hono/zod-openapi";

export const UserDTO = z.object({
  firstName: z.string().openapi({
    description: "First name of the user",
    example: "John",
  }),
  lastName: z.string().openapi({
    description: "Last name of the user",
    example: "doe",
  }),
  contactNo: z.string().openapi({
    description: "Contact number of the user",
    example: "+63920139423",
  }),
  address: z.string().openapi({
    description: "Address of the user",
    example: "2314 Potcholo House Street, Quezon City",
  }),
  email: z.string().email().openapi({
    description: "Email of the user",
    example: "example@email.com",
  }),
  password: z.string().min(8),
  role: z.enum(["admin", "staff", "customer"]).openapi({
    description: "Role of the user",
    example: "customer",
    default: "customer",
  }),
  userId: z.number(),
  dateReg: z.string().openapi({
    description: "The date where the user registered",
    example: new Date().toUTCString(),
  }),
  status: z.enum(["active", "inactive"]).openapi({
    description: "Status of the user",
    example: "active",
    default: "active",
  }),
});

export const GetUserDTO = UserDTO.omit({
  password: true
});

export const UpdateUserDTO = UserDTO.omit({
  password: true,
  dateReg: true,
  userId: true
}).partial();

// Delete User DTO just in case if needed
// export const DeleteUserDTO = z.object({
//     userId: z.number().positive().openapi({
//         description: "The id of the user to be deleted",
//         example: 1,
//     }),
//   });
