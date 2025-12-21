import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

const baseUser = {
  id: "user-has-company",
  email: "has@company.com",
};

describe("/users/has-company (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns hasCompany true when user is board member", async () => {
    jest.spyOn(prisma.boardMembers, "findMany").mockResolvedValue([
      {
        id: "bm1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: baseUser.id,
        companyId: "company-1",
        branchId: "branch-1",
        MembershipRole: [{ id: BigInt(1), role: "SELLER", boardMemberId: "bm1" }],
      },
    ] as any);

    const token = jwt.sign({ userId: baseUser.id }, authEnvs.jwtSecret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/users/has-company")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hasCompany: true });
  });

  it("returns hasCompany false when user has no memberships", async () => {
    jest.spyOn(prisma.boardMembers, "findMany").mockResolvedValue([] as any);

    const token = jwt.sign({ userId: baseUser.id }, authEnvs.jwtSecret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/users/has-company")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hasCompany: false });
  });

  it("ignores inactive memberships", async () => {
    jest.spyOn(prisma.boardMembers, "findMany").mockResolvedValue([
      {
        id: "bm1",
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: baseUser.id,
        companyId: "company-1",
        branchId: "branch-1",
        MembershipRole: [{ id: BigInt(1), role: "SELLER", boardMemberId: "bm1" }],
      },
    ] as any);

    const token = jwt.sign({ userId: baseUser.id }, authEnvs.jwtSecret, {
      expiresIn: "1h",
    });

    const response = await request(app)
      .get("/users/has-company")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hasCompany: false });
  });
});
