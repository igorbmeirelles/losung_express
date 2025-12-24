import { injectable } from "tsyringe";
import { prisma } from "../../../prisma/client.js";
import type {
  WarehouseQuery,
  WarehouseView,
} from "../../application/ports/warehouse-query.js";

@injectable()
export class PrismaWarehouseQuery implements WarehouseQuery {
  async findByCompany(companyId: string): Promise<WarehouseView[]> {
    const warehouses = await prisma.warehouse.findMany({
      where: { companyId, isActive: true },
      select: { id: true, name: true, companyId: true },
    });
    return warehouses;
  }

  async findByBranchIds(branchIds: string[]): Promise<WarehouseView[]> {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        isActive: true,
        BranchWarehouse: {
          some: {
            branchId: { in: branchIds },
            isActive: true,
          },
        },
      },
      select: { id: true, name: true, companyId: true },
    });
    return warehouses;
  }
}
