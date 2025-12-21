import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  CompanyRecord,
  CreateCompanyData,
  CompanyRepository,
} from "../../application/ports/company-repository.js";

@injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  async create(data: CreateCompanyData): Promise<CompanyRecord> {
    const company = await prisma.company.create({
      data: {
        name: data.name,
        tenantUrl: data.tenantUrl ?? "",
        isActive: data.isActive,
      },
    });

    return {
      id: company.id,
      name: company.name,
      tenantUrl: company.tenantUrl,
      isActive: company.isActive,
    };
  }
}
