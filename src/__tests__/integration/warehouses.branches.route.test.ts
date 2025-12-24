import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/warehouses/:warehouseId/branches (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("associates branch when authorized", async () => {
    jest.spyOn(prisma.branchWarehouse, "findFirst").mockResolvedValue(null as any);
    jest.spyOn(prisma.branchWarehouse, "create").mockResolvedValue({
      id: "bw1",
      warehouseId: "w1",
      branchId: "b1",
      isActive: true,
      branch: {} as any,
      warehouse: {} as any,
    } as any);

    const token = jwt.sign(
      {
        userId: "user-1",
        companyId: "c1",
        memberships: [{ role: "COMPANY_OWNER", branchId: "b1" }],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/warehouses/w1/branches")
      .set("Authorization", `Bearer ${token}`)
      .send({ branchId: "b1" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ warehouseId: "w1", branchId: "b1" });
    expect(prisma.branchWarehouse.create).toHaveBeenCalled();
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
      .post("/warehouses/w1/branches")
      .set("Authorization", `Bearer ${token}`)
      .send({ branchId: "b1" });

    expect(response.status).toBe(403);
  });
});
