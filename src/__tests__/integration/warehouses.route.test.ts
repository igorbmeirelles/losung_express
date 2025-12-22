import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/warehouses (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 201 and persists warehouse for authorized role", async () => {
    jest.spyOn(prisma.warehouse, "create").mockResolvedValue({
      id: "w1",
      name: "Main",
      description: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      companyId: "c1",
    } as any);

    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        roles: ["COMPANY_OWNER"],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/warehouses")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Main", description: "Primary" });

    expect(response.status).toBe(201);
    expect(response.body.warehouseId).toBe("w1");
    expect(prisma.warehouse.create).toHaveBeenCalled();
  });

  it("rejects unauthorized role with 403", async () => {
    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        roles: ["SELLER"],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/warehouses")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Main" });

    expect(response.status).toBe(403);
  });
});
