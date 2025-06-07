import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Resend } from "resend";
import { errorHandler } from "../middlewares/errorHandler";
import { grantPermission, verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";
import { contactFormHtml } from "../utils/emailTemplates";

const emailRoutes = new OpenAPIHono<AuthContext>();

emailRoutes.use("/*", authMiddleware);

emailRoutes.openapi(
  createRoute({
    tags: ["Email"],
    summary: "Send email from contact us",
    method: "post",
    path: "/send-email",
    request: {
      headers: z.object({
        Authorization: z.string().openapi({
          description: "Bearer access token",
          example: "Bearer <token>",
        }),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              email: z.string().openapi({
                description: "Email address of the sender",
                example: "pot@gmail.com",
              }),
              name: z.string().openapi({
                description: "Name of the sender",
                example: "Pot",
              }),
              message: z.string().openapi({
                description: "Message content from the sender",
                example: "Hello, I have a question about your service.",
              }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Email sent successfully",
      },
      403: {
        description: "Not authorized",
      },
      404: {
        description: "Not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const { name, email, message } = await c.req.json();
      const resend = new Resend(process.env.RESEND_API_KEY);
      const notifyResult = await resend.emails.send({
        from: "Contact Form <onboarding@resend.dev>",
        to: ["realrickyjones@gmail.com"],
        subject: `New Inquiry from ${name}`,
        replyTo: email,
        html: contactFormHtml({ name, email, message }),
      });

      if (notifyResult.error) {
        return c.json(
          { success: false, error: notifyResult.error.message },
          500
        );
      }
      return c.json({ message: "Email sent successfully." });
    } catch (err) {
      return errorHandler(err, c);
    }
  }
);

export default emailRoutes;
