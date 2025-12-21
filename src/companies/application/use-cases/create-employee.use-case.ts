import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { fail, ok, type Result } from "../../../shared/result.js";
import type { PasswordHasher } from "../../../users/application/contracts/password-hasher.js";
import type { UserRepository } from "../../../users/application/ports/user-repository.js";
import type { BoardMembersRepository } from "../ports/board-members-repository.js";
import { DEPENDENCY_TOKENS } from "../../../users/tokens.js";
import { COMPANY_DEPENDENCY_TOKENS } from "../../tokens.js";
import { CompanyRole } from "../../domain/company-role.enum.js";

export interface CreateEmployeeInput {
  creator: {
    id: string;
    roles: string[];
    branchIds: string[];
  };
  employee: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  branchId: string;
  roles: CompanyRole[];
  companyId: string;
}

export interface CreateEmployeeOutput {
  userId: string;
  branchId: string;
  roles: CompanyRole[];
}

export type CreateEmployeeError =
  | "UNAUTHORIZED"
  | "INVALID_INPUT"
  | "UNEXPECTED";

@injectable()
export class CreateEmployeeUseCase {
  constructor(
    @inject(DEPENDENCY_TOKENS.userRepository)
    private readonly userRepository: UserRepository,
    @inject(DEPENDENCY_TOKENS.passwordHasher)
    private readonly passwordHasher: PasswordHasher,
    @inject(COMPANY_DEPENDENCY_TOKENS.boardMembersRepository)
    private readonly boardMembersRepository: BoardMembersRepository
  ) {}

  async execute(
    input: CreateEmployeeInput
  ): Promise<Result<CreateEmployeeOutput, CreateEmployeeError>> {
    const validation = createEmployeeSchema.safeParse(input);
    if (!validation.success) {
      return fail("INVALID_INPUT");
    }

    if (!this.isCreatorAuthorized(validation.data.creator, validation.data.branchId)) {
      return fail("UNAUTHORIZED");
    }

    try {
      const passwordHash = await this.passwordHasher.hash(
        validation.data.employee.password
      );

      const user = await this.userRepository.create({
        firstName: validation.data.employee.firstName,
        lastName: validation.data.employee.lastName,
        email: validation.data.employee.email,
        passwordHash,
        isActive: true,
        companyId: validation.data.companyId,
      });

      await this.boardMembersRepository.create({
        userId: user.id,
        companyId: validation.data.companyId,
        branchId: validation.data.branchId,
        roles: validation.data.roles,
      });

      return ok({
        userId: user.id,
        branchId: validation.data.branchId,
        roles: validation.data.roles,
      });
    } catch (error) {
      return fail("UNEXPECTED");
    }
  }

  private isCreatorAuthorized(
    creator: CreateEmployeeInput["creator"],
    targetBranch: string
  ): boolean {
    const roles = creator.roles ?? [];
    const hasRole = (role: CompanyRole) => roles.includes(role);

    if (hasRole(CompanyRole.COMPANY_OWNER) || hasRole(CompanyRole.COMPANY_ADMIN)) {
      return true;
    }

    if (
      hasRole(CompanyRole.BRANCH_OWNER) ||
      hasRole(CompanyRole.BRANCH_ADMIN)
    ) {
      return creator.branchIds.includes(targetBranch);
    }

    return false;
  }
}

const createEmployeeSchema = z.object({
  creator: z.object({
    id: z.string().min(1),
    roles: z.array(z.string().min(1)),
    branchIds: z.array(z.string().min(1)),
  }),
  employee: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
  }),
  branchId: z.string().min(1),
  roles: z.array(z.nativeEnum(CompanyRole)).min(1),
  companyId: z.string().min(1),
});
