import { Router } from "express";
import { container } from "../../../container.js";
import { CreateWarehouseController } from "./create-warehouse.controller.js";
import { accessTokenMiddleware } from "../../../users/infrastructure/http/middlewares/access-token.middleware.js";

export function buildWarehouseRouter() {
  const router = Router();
  const createController = container.resolve(CreateWarehouseController);

  router.post(
    "/",
    accessTokenMiddleware(),
    (request, response) => createController.handle(request, response)
  );

  return router;
}
