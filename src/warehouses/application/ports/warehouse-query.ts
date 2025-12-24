export interface WarehouseView {
  id: string;
  name: string;
  companyId: string;
}

export interface WarehouseQuery {
  findByCompany(companyId: string): Promise<WarehouseView[]>;
  findByBranchIds(branchIds: string[]): Promise<WarehouseView[]>;
}
