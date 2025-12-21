import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { z } from "zod";
import type {
  CreateCompanyInput,
  CreateCompanyUseCase,
} from "../../application/use-cases/create-company.use-case.js";
import { COMPANY_DEPENDENCY_TOKENS } from "../../tokens.js";

const companySchema = z.object({
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
      complement: z.string().optional(),
    }),
  }),
});

@injectable()
export class CompanyController {
  constructor(
    @inject(COMPANY_DEPENDENCY_TOKENS.createCompanyUseCase)
    private readonly createCompanyUseCase: CreateCompanyUseCase
  ) {}

  async handle(request: Request, response: Response) {
    const parseResult = companySchema.safeParse(request.body);

    if (!parseResult.success) {
      return response.status(400).json({
        message: "Invalid company payload",
        issues: parseResult.error.flatten().fieldErrors,
      });
    }

    const user = (request as any).user as {
      userId?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    };

    if (
      !user ||
      !user.userId ||
      !user.firstName ||
      !user.lastName ||
      !user.email
    ) {
      return response.status(401).json({ message: "Invalid access token" });
    }

    const result = await this.createCompanyUseCase.execute({
      ...(parseResult.data as Omit<CreateCompanyInput, "user">),
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });

    if (result.success) {
      return response.status(201).json({
        companyId: result.value.companyId,
        branchId: result.value.branchId,
      });
    }

    if (result.error === "INVALID_INPUT") {
      return response.status(400).json({ message: "Invalid company data" });
    }

    return response
      .status(500)
      .json({ message: "Could not create company at this time" });
  }
}
