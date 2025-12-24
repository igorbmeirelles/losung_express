import { Router } from "express";
import { container } from "../../../container.js";
import { CreateWarehouseController } from "./create-warehouse.controller.js";
import { accessTokenMiddleware } from "../../../users/infrastructure/http/middlewares/access-token.middleware.js";
import { AssociateWarehouseBranchController } from "./associate-warehouse-branch.controller.js";

export function buildWarehouseRouter() {
  const router = Router();
  const createController = container.resolve(CreateWarehouseController);
  const associateController = container.resolve(AssociateWarehouseBranchController);

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

  return router;
}
