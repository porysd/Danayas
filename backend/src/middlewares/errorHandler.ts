import { makeError } from "../utils/errors";
import { type Context } from "hono";

export async function errorHandler(err: unknown, c: Context){
  const { error, statusCode } = makeError(
    err instanceof Error ? err : new Error("An unknown error occurred.")
  );
  
  console.error(error.message, error);
  
  const errorResponse = {
    code: statusCode,
    message: error.message,
  }

  return c.json(errorResponse, {statusCode: statusCode} as any);
}