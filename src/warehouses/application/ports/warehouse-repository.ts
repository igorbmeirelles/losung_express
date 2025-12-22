export interface CreateWarehouseData {
  name: string;
  companyId: string;
  isActive: boolean;
}

export interface WarehouseRecord {
  id: string;
  name: string;
  companyId: string;
  isActive: boolean;
}

export interface WarehouseRepository {
  create(data: CreateWarehouseData): Promise<WarehouseRecord>;
}
