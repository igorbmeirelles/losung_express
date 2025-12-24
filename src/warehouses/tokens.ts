export const WAREHOUSE_DEPENDENCY_TOKENS = {
  warehouseRepository: "WarehouseRepository",
  createWarehouseUseCase: "CreateWarehouseUseCase",
  branchWarehouseRepository: "BranchWarehouseRepository",
  associateWarehouseBranchUseCase: "AssociateWarehouseBranchUseCase",
  listWarehousesUseCase: "ListWarehousesUseCase",
  warehouseQuery: "WarehouseQuery",
} as const;

export type WarehouseDependencyKeys = keyof typeof WAREHOUSE_DEPENDENCY_TOKENS;
