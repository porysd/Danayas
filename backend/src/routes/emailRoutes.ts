// import { Hono } from 'hono';
// import { Resend } from 'resend';

// const emailRoutes = new Hono();
// const resend = new Resend(process.env.RESEND_API_KEY);

// emailRoutes.post('/send-email', async (c) => {
//   const { name, email, message } = await c.req.json();

//   const { error } = await resend.emails.send({
//     from: 'Contact <onboarding@resend.dev>',
//     to: ['your-email@example.com'], // Your recipient
//     subject: `New Inquiry from ${name}`,
//     reply_to: email,
//     html: `<p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`,
//   });

//   if (error) {
//     return c.json({ success: false, error: error.message }, 500);
//   }

//   return c.json({ success: true });
// });

// export default emailRoutes;

import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { db } from "../config/database";
import { authMiddleware } from "../middlewares/authMiddleware";
import { Resend } from "resend";
import { errorHandler } from "../middlewares/errorHandler";
import { grantPermission, verifyPermission } from "../utils/permissionUtils";
import type { AuthContext } from "../types";

const emailRoutes = new OpenAPIHono<AuthContext>();

emailRoutes.use("/*", authMiddleware);

emailRoutes.openapi(
  createRoute({
    tags: ["Email"],
    summary: "Email from Contact Us Form",
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
        to: ["realrickyjones@gmail.com"], // Replace with Danayas email
        subject: `New Inquiry from ${name}`,
        replyTo: email,
        html: `
        <div style="font-family: Arial, sans-serif; background: #fdfaf6; padding: 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="background: #1e3d25; padding: 20px 30px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h2 style="margin: 0; color: #fdfaf6;">Danayas Resort & Events Venue</h2>
              <p style="margin: 5px 0 0; color: #fdfaf6;">New Contact Inquiry</p>
            </div>
            <div style="padding: 30px;">
              <a style="font-size: 16px;">Hello Admin,</a>
              <a style="font-size: 15px;">You've received a new message from the <strong>Contact Us</strong> form.</a>
              <table style="width: 100%; margin-top: 20px; font-size: 15px;">
                <tr>
                  <a style="padding: 8px 0; font-weight: bold;">Name:</a>
                  <a style="padding: 8px 0;">${name}</a>
                </tr>
                <tr>
                  <a style="padding: 8px 0; font-weight: bold;">Email:</a>
                  <a style="padding: 8px 0;">${email}</a>
                </tr>
                <tr>
                  <a style="padding: 8px 0; font-weight: bold;">Message:</a>
                  <a style="padding: 8px 0;">${message}</a>
                </tr>
              </table>
              <p style="margin-top: 30px; font-size: 13px; color: #999;">
                Sent automatically by the website on ${new Date().toLocaleString()}.
              </p>
            </div>
            <div style="background: #1e3d25; padding: 15px 30px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; text-align: center;">
              <a style="margin: 0; font-size: 13px; color: #fdfaf6;">Danayas Resort & Events Venue</a>
              <a style="margin: 0; font-size: 12px; color: #ccc;">© ${new Date().getFullYear()} All rights reserved.</a>
            </div>
          </div>
        </div>
      `,
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
