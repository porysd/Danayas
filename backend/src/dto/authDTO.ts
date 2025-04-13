import { z } from "@hono/zod-openapi";
import { UserDTO } from "./userDTO";

export const RegisterDTO = UserDTO.pick({
  firstName: true,
  lastName: true,
  contactNo: true,
  address: true,
  email: true,
  password: true,
});

export const LoginDTO = UserDTO.pick({ email: true, password: true });

export const AccessTokenDTO = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string().default("Bearer"),
  exp: z.number().default(3600),
});
