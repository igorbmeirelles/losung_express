import { Router } from "express";
import { container } from "../../../container.js";
import { HasCompanyController } from "./has-company.controller.js";

export function buildHasCompanyRouter() {
  const router = Router();
  const controller = container.resolve(HasCompanyController);

  router.get("/", (request, response) => controller.handle(request, response));

  return router;
}
