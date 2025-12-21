export const COMPANY_DEPENDENCY_TOKENS = {
  companyRepository: "CompanyRepository",
  branchRepository: "BranchRepository",
  boardMembersRepository: "BoardMembersRepository",
  createCompanyUseCase: "CreateCompanyUseCase",
} as const;

export type CompanyDependencyKeys = keyof typeof COMPANY_DEPENDENCY_TOKENS;
