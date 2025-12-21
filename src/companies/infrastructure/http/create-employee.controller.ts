import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  CreateEmployeeInput,
  CreateEmployeeUseCase,
} from "../../application/use-cases/create-employee.use-case.js";
import { COMPANY_DEPENDENCY_TOKENS } from "../../tokens.js";
import { CompanyRole } from "../../domain/company-role.enum.js";

const employeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  branchId: z.string().min(1),
  roles: z.array(z.nativeEnum(CompanyRole)).min(1),
});

@injectable()
export class CreateEmployeeController {
  constructor(
    @inject(COMPANY_DEPENDENCY_TOKENS.createEmployeeUseCase)
    private readonly createEmployeeUseCase: CreateEmployeeUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const user = request.user;
    if (!user || !user.userId) {
      return response.status(401).json({ message: "Invalid access token" });
    }
    if (!user.companyId) {
      return response.status(400).json({ message: "User must belong to a company" });
    }

    const parseResult = employeeSchema.safeParse(request.body);
    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid employee payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const result = await this.createEmployeeUseCase.execute({
      creator: {
        id: user.userId,
        roles: user.roles ?? [],
        branchIds: user.branchIds ?? [],
      },
      employee: {
        firstName: parseResult.data.firstName,
        lastName: parseResult.data.lastName,
        email: parseResult.data.email,
        password: parseResult.data.password,
      },
      branchId: parseResult.data.branchId,
      roles: parseResult.data.roles,
      companyId: user.companyId,
    } as CreateEmployeeInput);

    if (result.success) {
      return response.status(201).json({
        userId: result.value.userId,
        branchId: result.value.branchId,
        roles: result.value.roles,
      });
    }

    if (result.error === "UNAUTHORIZED") {
      return response.status(403).json({ message: "Not allowed to create employee" });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid employee data" });
    }

    return response
      .status(500)
      .json({ message: "Could not create employee at this time" });
  }
}
