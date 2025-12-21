import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { CompanyRepository } from "../ports/company-repository.js";
import type { BranchRepository } from "../ports/branch-repository.js";
import type { BoardMembersRepository } from "../ports/board-members-repository.js";
import { COMPANY_DEPENDENCY_TOKENS } from "../../tokens.js";
import { CompanyRole } from "../../domain/company-role.enum.js";

export interface CreateCompanyInput {
  name: string;
  tenantUrl?: string;
  branch: {
    name: string;
    phone: string;
    address: {
      street: string;
      neighborhood: string;
      city: string;
      country: string;
      zipCode: string;
      number: string;
      complement?: string | null;
    };
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateCompanyOutput {
  companyId: string;
  branchId: string;
}

export type CreateCompanyError = "INVALID_INPUT" | "UNEXPECTED";

@injectable()
export class CreateCompanyUseCase {
  constructor(
    @inject(COMPANY_DEPENDENCY_TOKENS.companyRepository)
    private readonly companyRepository: CompanyRepository,
    @inject(COMPANY_DEPENDENCY_TOKENS.branchRepository)
    private readonly branchRepository: BranchRepository,
    @inject(COMPANY_DEPENDENCY_TOKENS.boardMembersRepository)
    private readonly boardMembersRepository: BoardMembersRepository
  ) {}

  async execute(
    input: CreateCompanyInput
  ): Promise<Result<CreateCompanyOutput, CreateCompanyError>> {
    const validation = createCompanySchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    try {
      const company = await this.companyRepository.create({
        name: validation.data.name,
        tenantUrl: validation.data.tenantUrl ?? null,
        isActive: true,
      });

      const branch = await this.branchRepository.create({
        companyId: company.id,
        name: validation.data.branch.name,
        phone: validation.data.branch.phone,
        address: {
          ...validation.data.branch.address,
          complement: validation.data.branch.address.complement ?? null,
        },
      });

      await this.boardMembersRepository.create({
        userId: validation.data.user.id,
        companyId: company.id,
        branchId: branch.id,
        roles: [CompanyRole.COMPANY_OWNER],
      });

      return ok({
        companyId: company.id,
        branchId: branch.id,
      });
    } catch (error) {
      return fail("UNEXPECTED");
    }
  }
}

const createCompanySchema = z.object({
  name: z.string().min(1),
  tenantUrl: z.string().optional(),
  branch: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.object({
      street: z.string().min(1),
      neighborhood: z.string().min(1),
      city: z.string().min(1),
      country: z.string().min(1),
      zipCode: z.string().min(1),
      number: z.string().min(1),
      complement: z.string().nullish(),
    }),
  }),
  user: z.object({
    id: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
  }),
});
