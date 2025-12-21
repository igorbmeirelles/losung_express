import { Router } from "express";
import { container } from "../../../container.js";
import { CompanyController } from "./company.controller.js";
import { accessTokenMiddleware } from "../../../users/infrastructure/http/middlewares/access-token.middleware.js";
import { ListBranchesController } from "./list-branches.controller.js";

export function buildCompanyRouter() {
  const router = Router();
  const controller = container.resolve(CompanyController);
  const listBranchesController = container.resolve(ListBranchesController);

  router.post(
    "/",
    accessTokenMiddleware(),
    (request, response) => controller.handle(request, response)
  );
  router.get(
    "/branches",
    accessTokenMiddleware(),
    (request, response) => listBranchesController.handle(request, response)
  );

  return router;
}
