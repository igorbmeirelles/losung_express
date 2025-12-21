import { Router } from "express";
import { container } from "../../../container.js";
import { CompanyController } from "./company.controller.js";
import { accessTokenMiddleware } from "../../../users/infrastructure/http/middlewares/access-token.middleware.js";

export function buildCompanyRouter() {
  const router = Router();
  const controller = container.resolve(CompanyController);

  router.post(
    "/",
    accessTokenMiddleware(),
    (request, response) => controller.handle(request, response)
  );

  return router;
}
