import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/companies/employees (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("allows COMPANY_OWNER to create employee in any branch", async () => {
    jest.spyOn(prisma.user, "create").mockResolvedValue({
      id: "emp-1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "hashed",
      isActive: true,
      companyId: "c1",
    } as any);

    jest.spyOn(prisma.boardMembers, "create").mockResolvedValue({
      id: "bm1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "emp-1",
      companyId: "c1",
      branchId: "b2",
      MembershipRole: [{ id: BigInt(1), role: "SELLER", boardMemberId: "bm1" }],
    } as any);

    const token = jwt.sign(
      {
        userId: "owner-1",
        roles: ["COMPANY_OWNER"],
        branchIds: ["b1"],
        companyId: "c1",
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/companies/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Doe",
      email: "john@example.com",
      password: "secret",
      branchId: "b2",
      roles: ["SELLER"],
    });

    expect(response.status).toBe(201);
    expect(response.body.userId).toBe("emp-1");
    expect(prisma.user.create).toHaveBeenCalled();
    expect(prisma.boardMembers.create).toHaveBeenCalled();
  });

  it("rejects unauthorized creator role", async () => {
    const token = jwt.sign(
      {
        userId: "user-1",
        roles: ["SELLER"],
        branchIds: ["b1"],
        companyId: "c1",
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/companies/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Doe",
      email: "john@example.com",
      password: "secret",
      branchId: "b1",
      roles: ["SELLER"],
    });

    expect(response.status).toBe(403);
  });

  it("rejects branch assignment outside creator scope for branch admin", async () => {
    const token = jwt.sign(
      {
        userId: "user-1",
        roles: ["BRANCH_ADMIN"],
        branchIds: ["b1"],
        companyId: "c1",
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/companies/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "John",
        lastName: "Doe",
      email: "john@example.com",
      password: "secret",
      branchId: "b2",
      roles: ["SELLER"],
    });

    expect(response.status).toBe(403);
  });
});
