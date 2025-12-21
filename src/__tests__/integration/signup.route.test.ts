import { afterEach, describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";

const basePayload = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  password: "password123",
};

describe("/signup (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return HTTP 201 on successful signup", async () => {
    const createSpy = jest.spyOn(prisma.user, "create").mockImplementation(
      ({ data }) =>
        ({
          id: "user-1",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          isActive: data.isActive,
          companyId: data.companyId ?? null,
        } as unknown as ReturnType<typeof prisma.user.create>)
    );

    const response = await request(app).post("/signup").send(basePayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({});
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it("should persist user with hashed password", async () => {
    const createSpy = jest.spyOn(prisma.user, "create").mockImplementation(
      ({ data }) =>
        ({
          id: "user-1",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          isActive: data.isActive,
          companyId: data.companyId ?? null,
        } as unknown as ReturnType<typeof prisma.user.create>)
    );

    await request(app).post("/signup").send(basePayload);

    const hashed = createSpy.mock.calls[0]?.[0]?.data?.password;
    expect(typeof hashed).toBe("string");
    expect(hashed).not.toBe(basePayload.password);
    expect(hashed?.startsWith("$argon2")).toBe(true);
  });

  it("should not return JWT token in response", async () => {
    jest.spyOn(prisma.user, "create").mockImplementation(
      ({ data }) =>
        ({
          id: "user-1",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          isActive: data.isActive,
          companyId: data.companyId ?? null,
        } as unknown as ReturnType<typeof prisma.user.create>)
    );

    const response = await request(app).post("/signup").send(basePayload);

    expect(response.body.token).toBeUndefined();
    expect(response.body.jwt).toBeUndefined();
    expect(response.body.accessToken).toBeUndefined();
  });

  it("should validate request payload with Zod", async () => {
    const createSpy = jest
      .spyOn(prisma.user, "create")
      .mockResolvedValue({} as Awaited<ReturnType<typeof prisma.user.create>>);

    const response = await request(app)
      .post("/signup")
      .send({ ...basePayload, password: "a".repeat(30) });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid signup payload");
    expect(createSpy).not.toHaveBeenCalled();
  });
});
