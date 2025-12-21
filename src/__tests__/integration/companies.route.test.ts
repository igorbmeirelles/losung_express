import { afterEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../prisma/client.js";
import { authEnvs } from "../../globals/envs.js";

describe("/companies (integration)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 201, create company stack, and return IDs", async () => {
    jest.spyOn(prisma.company, "create").mockResolvedValue({
      id: "company-1",
      name: "Acme",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      tenantUrl: "acme.test",
      supplier: [],
      branches: [],
      BoardMembers: [],
      Warehouse: [],
      Product: [],
      Attribute: [],
      Category: [],
      customers: [],
    } as any);

    jest.spyOn(prisma.branch, "create").mockResolvedValue({
      id: "branch-1",
      name: "Acme - Main Branch",
      phone: "N/A",
      companyId: "company-1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      locationId: "loc-1",
      location: {} as any,
      company: {} as any,
      BoardMembers: [],
      BranchWarehouse: [],
      Order: [],
    } as any);

    jest.spyOn(prisma.boardMembers, "create").mockResolvedValue({
      id: "bm1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "user-1",
      companyId: "company-1",
      branchId: "branch-1",
      MembershipRole: [{ id: BigInt(1), role: "COMPANY_OWNER", boardMemberId: "bm1" }],
    } as any);

    const accessToken = jwt.sign(
      {
        userId: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
      },
      authEnvs.jwtSecret,
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/companies")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Acme",
        tenantUrl: "acme.test",
        branch: {
          name: "Main",
          phone: "123",
          address: {
            street: "Street",
            neighborhood: "Neighborhood",
            city: "City",
            country: "Country",
            zipCode: "000",
            number: "1",
          },
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.companyId).toBe("company-1");
    expect(response.body.branchId).toBe("branch-1");
    expect(prisma.company.create).toHaveBeenCalled();
    expect(prisma.branch.create).toHaveBeenCalled();
    expect(prisma.boardMembers.create).toHaveBeenCalled();
  });
});
