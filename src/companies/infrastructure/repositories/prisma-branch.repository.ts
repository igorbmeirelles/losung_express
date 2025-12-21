import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  BranchRecord,
  BranchRepository,
  CreateBranchData,
} from "../../application/ports/branch-repository.js";
import type { Prisma } from "../../../prisma/generated/prisma/client.js";

@injectable()
export class PrismaBranchRepository implements BranchRepository {
  async create(data: CreateBranchData): Promise<BranchRecord> {
    const createData: Prisma.BranchCreateInput = {
      name: data.name,
      phone: data.phone,
      isActive: true,
      company: {
        connect: { id: data.companyId },
      },
      location: {
        create: {
          number: data.address.number,
          complement: data.address.complement ?? null,
          addresses: {
            create: {
              street: data.address.street,
              neighborhood: data.address.neighborhood,
              city: data.address.city,
              country: data.address.country,
              zipCode: data.address.zipCode,
            },
          },
        },
      },
    };

    const branch = await prisma.branch.create({
      data: createData,
    });

    return {
      id: branch.id,
      name: branch.name,
      phone: branch.phone,
      companyId: branch.companyId,
    };
  }
}
