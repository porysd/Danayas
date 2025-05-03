import { authMiddleware } from "../middlewares/authMiddleware";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { UnauthorizedError } from "../utils/errors";
import { verify } from "hono/jwt";

(globalThis as any).Bun = { env: { JWT_ACCESS_SECRET: "mock-secret-key" } };

vi.mock("hono/jwt", () => ({
  verify: vi.fn(),
}));

function createMockContext(headers: Record<string, string> = {}) {
  return {
    req: {
      header: (name: string) => headers[name],
    },
    set: vi.fn(),
    get: vi.fn(),
    next: vi.fn(),
    json: vi.fn(),
  };
}

let c: any;
let next: any;

describe("authMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    c = createMockContext();
    next = vi.fn();
  });

  afterAll(() => {
    delete (globalThis as any).Bun;
  });

  it("should call errorHandler if Authorization header is missing", async () => {
    const errorHandlerMock = vi.fn();
    c.json = errorHandlerMock;

    await authMiddleware(c, next);

    expect(errorHandlerMock).toHaveBeenCalledTimes(1);
    expect(errorHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 401,
        message: "Authorization header is missing",
      }),
      expect.objectContaining({
        status: 401,
      })
    );
  });

  it("should call errorHandler if Access token is missing", async () => {
    const errorHandlerMock = vi.fn();
    c.json = errorHandlerMock;

    c.req.header = vi.fn().mockReturnValue("Bearer ");

    await authMiddleware(c, next);

    expect(errorHandlerMock).toHaveBeenCalledTimes(1);
    expect(errorHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 401,
        message: "Access token is missing",
      }),
      expect.objectContaining({
        status: 401,
      })
    );
  });

  it("should call errorHandler if token is invalid or expired", async () => {
    const errorHandlerMock = vi.fn();
    c.json = errorHandlerMock;

    c.req.header = vi.fn().mockReturnValue("Bearer invalid_token");

    vi.mocked(verify).mockRejectedValue(new UnauthorizedError("Invalid or expired token"));

    await authMiddleware(c, next);

    expect(errorHandlerMock).toHaveBeenCalledTimes(1);
    expect(errorHandlerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 401,
        message: "Invalid or expired token",
      }),
      expect.objectContaining({
        status: 401,
      })
    );
  });

  it("should proceed to next if token is valid", async () => {
    const nextMock = vi.fn();
    const validToken = "valid_token";

    vi.mocked(verify).mockResolvedValue({
      sub: "123",
      role: "admin",
    });

    c.req.header = vi.fn().mockReturnValue(`Bearer ${validToken}`);

    await authMiddleware(c, nextMock);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(c.set).toHaveBeenCalledWith("userId", "123");
    expect(c.set).toHaveBeenCalledWith("role", "admin");
  });
});