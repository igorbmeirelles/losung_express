import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  CreateWarehouseData,
  WarehouseRecord,
  WarehouseRepository,
} from "../../application/ports/warehouse-repository.js";

@injectable()
export class PrismaWarehouseRepository implements WarehouseRepository {
  async create(data: CreateWarehouseData): Promise<WarehouseRecord> {
    const warehouse = await prisma.warehouse.create({
      data: {
        name: data.name,
        companyId: data.companyId,
        isActive: data.isActive,
      },
    });

    return {
      id: warehouse.id,
      name: warehouse.name,
      companyId: warehouse.companyId,
      isActive: warehouse.isActive,
    };
  }
}
