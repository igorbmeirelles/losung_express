export interface BranchView {
  id: string;
  name: string;
  phone: string;
  companyId: string;
}

export interface BranchQuery {
  findByIds(branchIds: string[]): Promise<BranchView[]>;
}
