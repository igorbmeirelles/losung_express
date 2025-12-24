import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/categories (GET) (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 200 with categories for authorized user", async () => {
    jest.spyOn(prisma.category, "findMany").mockResolvedValue([
      {
        id: "cat-1",
        name: "Cat",
        parentId: null,
        companyId: "c1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);

    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        memberships: [{ role: "COMPANY_OWNER", branchId: null }],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.categories).toHaveLength(1);
  });

  it("rejects unauthorized roles", async () => {
    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        memberships: [{ role: "UNKNOWN", branchId: null }],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
  });

  it("should not expose categories from other companies", async () => {
    const spy = jest
      .spyOn(prisma.category, "findMany")
      .mockResolvedValue([] as any);

    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        memberships: [{ role: "COMPANY_OWNER", branchId: null }],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: "c1" },
      })
    );
  });
});
