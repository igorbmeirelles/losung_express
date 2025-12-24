export interface CreateBranchWarehouseData {
  warehouseId: string;
  branchId: string;
  isActive: boolean;
}

export interface BranchWarehouseRecord {
  id: string;
  warehouseId: string;
  branchId: string;
  isActive: boolean;
}

export interface BranchWarehouseRepository {
  create(data: CreateBranchWarehouseData): Promise<BranchWarehouseRecord>;
  exists(warehouseId: string, branchId: string): Promise<boolean>;
}
