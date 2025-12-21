export const COMPANY_DEPENDENCY_TOKENS = {
  companyRepository: "CompanyRepository",
  branchRepository: "BranchRepository",
  boardMembersRepository: "BoardMembersRepository",
  createCompanyUseCase: "CreateCompanyUseCase",
  listBranchesUseCase: "ListBranchesUseCase",
  branchQuery: "BranchQuery",
} as const;

export type CompanyDependencyKeys = keyof typeof COMPANY_DEPENDENCY_TOKENS;
