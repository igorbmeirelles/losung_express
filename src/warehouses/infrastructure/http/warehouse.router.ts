import { Router } from "express";
import { container } from "../../../container.js";
import { CreateWarehouseController } from "./create-warehouse.controller.js";
import { accessTokenMiddleware } from "../../../users/infrastructure/http/middlewares/access-token.middleware.js";
import { AssociateWarehouseBranchController } from "./associate-warehouse-branch.controller.js";
import { ListWarehousesController } from "./list-warehouses.controller.js";

export function buildWarehouseRouter() {
  const router = Router();
  const createController = container.resolve(CreateWarehouseController);
  const associateController = container.resolve(AssociateWarehouseBranchController);
  const listController = container.resolve(ListWarehousesController);

  router.post(
    "/",
    accessTokenMiddleware(),
    (request, response) => createController.handle(request, response)
  );

  router.post(
    "/:warehouseId/branches",
    accessTokenMiddleware(),
    (request, response) => associateController.handle(request, response)
  );
  router.get(
    "/",
    accessTokenMiddleware(),
    (request, response) => listController.handle(request, response)
  );

  return router;
}
