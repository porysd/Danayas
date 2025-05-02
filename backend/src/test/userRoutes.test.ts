// import { Hono } from "hono";
// import { testClient } from "hono/testing";
// import { describe, it, expect, beforeAll, afterAll } from "bun:test";
// import userRoutes from ".././routes/temp/userRoutes.hono";
// import db from "../config/database";
// import { UsersTable } from "../schemas/User";
// import { ErrorSchema } from "../utils/ErrorSchema";
// import { GetUserDTO, UpdateUserDTO, CreateUserDTO } from "../dto/userDTO";
// import type { z } from "zod";

// beforeAll(() => {
//   db.$client.exec(`
//     CREATE TABLE IF NOT EXISTS USER (
//       userId INTEGER PRIMARY KEY AUTOINCREMENT,
//       username TEXT NOT NULL,
//       firstName TEXT NOT NULL,
//       lastName TEXT NOT NULL,
//       contactNo TEXT NOT NULL,
//       address TEXT NOT NULL,
//       dateReg TEXT NOT NULL,
//       status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'disable')) DEFAULT 'active',
//       email TEXT NOT NULL UNIQUE,
//       password TEXT NOT NULL,
//       role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'customer')) DEFAULT 'customer'
//     );
//   `);

//   db.insert(UsersTable).values([
//     {
//       userId: 23,
//       username: "gardnerk",
//       firstName: "Gardner",
//       lastName: "Kris",
//       contactNo: "1234567890",
//       address: "123 Main St",
//       dateReg: new Date().toUTCString(),
//       status: "active",
//       email: "Jerrod.Barrows@gmail.com",
//       password: "hashedpassword",
//       role: "admin",
//     },
//   ]).run();
// });

// afterAll(() => {
//   db.$client.exec("DROP TABLE IF EXISTS USER");
// });

// describe("GET /search", () => {
//   const client = testClient(userRoutes);

//   it("should return search results", async () => {
//     const res = await client.search.$get({
//       query: {
//         query: "Gardner",
//         limit: "2",
//       },
//     });

//     expect(res.status).toBe(200);

//     const json = await res.json();

//     expect(json).toEqual({
//       total: 1,
//       items: [
//         {
//           userId: 23,
//           firstName: "Gardner",
//           lastName: "Kris",
//           email: "Jerrod.Barrows@gmail.com",
//         },
//       ],
//     });
//   });

//   it("should return 400 response if query is empty.", async () => {
//     const res = await client.search.$get({
//       query: { query: "" },
//     });

//     expect(res.status).toBe(400);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();

//   });

//   it("should return 404 response if user not found.", async () => {
//     const res = await client.search.$get({
//       query: { query: "Jizuuu" }
//     })

//     expect(res.status).toBe(404);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();
//   });
// });

// describe("GET /:id", () => {
//   const client = testClient(userRoutes);

//   it("should return a user by id.", async () => {
//     const res = await client[":id"].$get({
//       param: {
//         id: "23"
//       }
//     })

//     expect(res.status).toBe(200);
//   })

//   it("should return 400 response if id is not a number.", async () => {
//     const res = await client[":id"].$get({
//       param: {
//         id: "abc"
//       }
//     })

//     expect(res.status).toBe(400);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();
//   })

//   it("should return 404 response if user not found.", async () => {
//     const res = await client[":id"].$get({
//       param: {
//         id: "22"
//       }
//     })

//     expect(res.status).toBe(404);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();
//   })

//   it("should return a validated user.", async () => {
//     const res = await client[":id"].$get({
//       param: {
//         id: "23"
//       }
//     })

//     expect(res.status).toBe(200);
//     const json = GetUserDTO.parse(await res.json());
//     expect(json).toEqual({
//       userId: 23,
//       username: "gardnerk",
//       firstName: "Gardner",
//       lastName: "Kris",
//       contactNo: "1234567890",
//       address: "123 Main St",
//       dateReg: expect.any(String),
//       status: "active",
//       email: "Jerrod.Barrows@gmail.com",
//       role: "admin"
//     });
//   })
// });

// describe("PATCH /:id", () => {
//   const client = testClient(userRoutes);

//   it("should update a user by id.", async () => {
//     const updatedData: z.infer<typeof UpdateUserDTO>= {
//       username: "updatedUser",
//       firstName: "Updated",
//       lastName: "Name",
//       contactNo: "0987654321",
//       address: "Updated Address",
//       email: "updated.email@example.com",
//       role: "staff",
//       status: "inactive",
//     };

//     const res = await client[":id"].$patch({
//       param: { id: "23" },
//       json: updatedData,
//     });

//     expect(res.status).toBe(200);
//     const json = await res.json();

//     Object.entries(updatedData).forEach(([key, value]) => {
//       expect(json).toHaveProperty(key, value);
//     });
//   });

//   it("should return 400 response if id is not a number.", async () => {
//     const res = await client[":id"].$patch({
//       param: { id: "abc" },
//       json: {}, // still needs a body to avoid 500 JSON error
//     });

//     expect(res.status).toBe(400);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();
//   });

//   it("should return 404 response if user not found.", async () => {
//     const ghostData: z.infer<typeof UpdateUserDTO> = {
//       username: "ghost",
//       firstName: "Ghost",
//       lastName: "User",
//       contactNo: "0000000000",
//       address: "Nowhere",
//       email: "ghost@example.com",
//       role: "customer",
//       status: "inactive",
//     }
    
//     const res = await client[":id"].$patch({
//       param: { id: "999" },
//       json: ghostData,
//     });

//     expect(res.status).toBe(404);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();
//   });
// });

// describe("DELETE /:id", () =>{
//   const client = testClient(userRoutes);

//   it("should delete the user by id.", async () => {
//     const res = await client[":id"].$delete({
//       param: {
//         id: "23"
//       }
//     })

//     expect(res.status).toBe(200);
//   });

//   it("should return 400 response if userId is invalid.", async () => {
//     const res = await client[":id"].$delete({
//       param: {
//         id: "haha"
//       }
//     })

//     expect(res.status).toBe(400);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();
//   });

//   it("should return 404 response if user not found.", async () => {
//     const res = await client[":id"].$delete({
//       param: {
//         id: "69"
//       }
//     })

//     expect(res.status).toBe(404);
//     const body = ErrorSchema.parse(await res.json());
//     expect(body.message).toBeDefined();
//   });
// });

// describe("GET /", () => {
//   const client = testClient(userRoutes);

//   it("should return a paginated list of users.", async () => {
//     const res = await client.index.$get({
//       query: {
//         limit: "10",
//         page: "1"
//       },
//     })
//     const json = await res.json() as any;

//     if (res.status === 200) {
//       expect(json).toHaveProperty("total");
//       expect(json).toHaveProperty("items");
//       expect(Array.isArray(json.items)).toBe(true);
//     } else {
//       expect(json).toHaveProperty("code");
//       expect(json).toHaveProperty("message");
//     }
//   })

//   it("should return an empty items array if no users found in that page", async () => {
//     const res = await client.index.$get({
//       query: {
//         limit: "10",
//         page: "9999"
//       },
//     });
  
//     const json = await res.json() as any;
//     expect(res.status).toBe(200);
//     expect(json.total).toBe(0);
//     expect(Array.isArray(json.items)).toBe(true);
//     expect(json.items.length).toBe(0);
//   });
// });

// describe("POST /", () => {
//   const client = testClient(userRoutes);

//   it("should create a new user successfully", async () => {
//     const res = await client.index.$post({
//       json: {
//         username: "newUser",
//         firstName: "New",
//         lastName: "User",
//         contactNo: "1234567890",
//         address: "123 Main St",
//         email: "newuser@example.com",
//         password: "securepassword123",
//         role: "customer",
//       },
//     });

//     const json = await res.json();

//     if (res.status === 200) {
//       expect(json).toMatchObject({
//         username: "newUser",
//         firstName: "New",
//         lastName: "User",
//         contactNo: "1234567890",
//         address: "123 Main St",
//         email: "newuser@example.com",
//         role: "customer",
//         status: "active",
//       });
//       expect(json).not.toHaveProperty("password");
//     }
//   });
//   it("should return 409 if the user already exists", async () => {
//     const res = await client.index.$post({
//       json: {
//         username: "newUser",
//         firstName: "New",
//         lastName: "User",
//         contactNo: "1234567890",
//         address: "123 Main St",
//         email: "newuser@example.com",
//         password: "securepassword123",
//         role: "customer",
//       },
//     });

//     expect(res.status).toBe(409);
//     const body = await res.json();
//     expect(body).toHaveProperty("code");
//     expect(body).toHaveProperty("message");
//   });
// });

// describe("PATCH /disable/:id", () => {
//   const client = testClient(userRoutes);
//   let createdUserId: number;

//   beforeAll(async () => {
//     const res = await client.index.$post({
//       json: {
//         username: "disableme",
//         firstName: "Disable",
//         lastName: "Test",
//         contactNo: "9876543210",
//         address: "456 Test Ave",
//         email: "disableme@example.com",
//         password: "testpass123",
//         role: "customer",
//       },
//     });

//     expect(res.status).toBe(200);
//     const json = await res.json();

//     if ("userId" in json) {
//       createdUserId = json.userId;
//     } else {
//       throw new Error("Failed to create user for disable test");
//     }
//   });

//   it("should disable the user successfully", async () => {
//     const res = await client.disable[":id"].$patch({
//       param: { id: String(createdUserId) },
//     });

//     expect(res.status).toBe(200);
//     const body = await res.json();
//     expect(body).toMatchObject({
//       message: "User disabled successfully",
//       paramId: createdUserId,
//     });
//   });

//   it("should return 400 for invalid user ID", async () => {
//     const res = await client.disable[":id"].$patch({
//       param: { id: "invalid" },
//     });

//     expect(res.status).toBe(400);
//     const body = await res.json();
//     expect(body).toHaveProperty("message", "Invalid user ID");
//   });

//   it("should return 404 response if user not found", async () => {
//     const res = await client.disable[":id"].$patch({
//       param: { id: "999999" },
//     });

//     expect(res.status).toBe(404);
//     const body = await res.json();
//     expect(body).toHaveProperty("message", "User not found");
//   });
// });

// describe("PATCH /enable/:id", () => {
//   const client = testClient(userRoutes);
//   let createdUserId: number;

//   beforeAll(async () => {
//     const res = await client.index.$post({
//       json: {
//         username: "enableme",
//         firstName: "Enable",
//         lastName: "Test",
//         contactNo: "0123456789",
//         address: "789 Test Blvd",
//         email: "enableme@example.com",
//         password: "enablepass456",
//         role: "customer",
//       },
//     });

//     expect(res.status).toBe(200);
//     const json = await res.json();

//     if ("userId" in json) {
//       createdUserId = json.userId;

//       await client.disable[":id"].$patch({
//         param: { id: String(createdUserId) },
//       });
//     } else {
//       throw new Error("Failed to create user for enable test");
//     }
//   });

//   it("should enable the user successfully", async () => {
//     const res = await client.enable[":id"].$patch({
//       param: { id: String(createdUserId) },
//     });

//     expect(res.status).toBe(200);
//     const body = await res.json();
//     expect(body).toMatchObject({
//       message: "User enabled successfully",
//       paramId: createdUserId,
//     });
//   });

//   it("should return 400 response if userId is invalid", async () => {
//     const res = await client.enable[":id"].$patch({
//       param: { id: "invalid" },
//     });

//     expect(res.status).toBe(400);
//     const body = await res.json();
//     expect(body).toHaveProperty("message", "Invalid user ID");
//   });

//   it("should return 404 if user does not exist", async () => {
//     const res = await client.enable[":id"].$patch({
//       param: { id: "999999" },
//     });

//     expect(res.status).toBe(404);
//     const body = await res.json();
//     expect(body).toHaveProperty("message", "User not found");
//   });
// });