export const WAREHOUSE_DEPENDENCY_TOKENS = {
  warehouseRepository: "WarehouseRepository",
  createWarehouseUseCase: "CreateWarehouseUseCase",
} as const;

export type WarehouseDependencyKeys = keyof typeof WAREHOUSE_DEPENDENCY_TOKENS;
