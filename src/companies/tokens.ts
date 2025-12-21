export const COMPANY_DEPENDENCY_TOKENS = {
  companyRepository: "CompanyRepository",
  branchRepository: "BranchRepository",
  boardMembersRepository: "BoardMembersRepository",
  createCompanyUseCase: "CreateCompanyUseCase",
  listBranchesUseCase: "ListBranchesUseCase",
  branchQuery: "BranchQuery",
  createEmployeeUseCase: "CreateEmployeeUseCase",
} as const;

export type CompanyDependencyKeys = keyof typeof COMPANY_DEPENDENCY_TOKENS;
