import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/warehouses (GET) (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns warehouses for company owner/admin", async () => {
    jest.spyOn(prisma.warehouse, "findMany").mockResolvedValue([
      {
        id: "w1",
        name: "Main",
        isActive: true,
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
      .get("/warehouses")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.warehouses).toHaveLength(1);
  });

  it("returns branch-scoped warehouses for branch roles", async () => {
    jest.spyOn(prisma.warehouse, "findMany").mockResolvedValue([
      {
        id: "w2",
        name: "Branch Warehouse",
        isActive: true,
        companyId: "c1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any);

    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        memberships: [{ role: "BRANCH_ADMIN", branchId: "b1" }],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .get("/warehouses")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.warehouses).toHaveLength(1);
  });

  it("rejects unauthorized role", async () => {
    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        memberships: [{ role: "SELLER", branchId: "b1" }],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .get("/warehouses")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(403);
  });
});
