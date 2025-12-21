import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/companies/branches (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 200 with branches from JWT context", async () => {
    jest.spyOn(prisma.branch, "findMany").mockResolvedValue([
      {
        id: "b1",
        name: "Branch 1",
        phone: "123",
        companyId: "c1",
        isActive: true,
        locationId: "loc1",
      },
      {
        id: "b2",
        name: "Branch 2",
        phone: "456",
        companyId: "c1",
        isActive: true,
        locationId: "loc2",
      },
    ] as any);

    const accessToken = jwt.sign(
      {
        userId: "user-1",
        branchIds: ["b1", "b2"],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .get("/companies/branches")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.branches).toHaveLength(2);
  });

  it("returns empty array when user has no branchIds", async () => {
    const accessToken = jwt.sign(
      {
        userId: "user-1",
        branchIds: [],
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .get("/companies/branches")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.branches).toEqual([]);
  });
});
