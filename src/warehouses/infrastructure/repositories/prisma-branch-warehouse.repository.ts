import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  BranchWarehouseRecord,
  BranchWarehouseRepository,
  CreateBranchWarehouseData,
} from "../../application/ports/branch-warehouse-repository.js";

@injectable()
export class PrismaBranchWarehouseRepository
  implements BranchWarehouseRepository
{
  async create(data: CreateBranchWarehouseData): Promise<BranchWarehouseRecord> {
    const record = await prisma.branchWarehouse.create({
      data: {
        warehouseId: data.warehouseId,
        branchId: data.branchId,
        isActive: data.isActive,
      },
    });

    return {
      id: record.id,
      warehouseId: record.warehouseId,
      branchId: record.branchId,
      isActive: record.isActive,
    };
  }

  async exists(warehouseId: string, branchId: string): Promise<boolean> {
    const found = await prisma.branchWarehouse.findFirst({
      where: { warehouseId, branchId },
      select: { id: true },
    });
    return !!found;
  }
}
