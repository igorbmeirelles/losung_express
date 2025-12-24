import { Router } from "express";
import { container } from "../../../container.js";
import { CreateCategoryController } from "./create-category.controller.js";
import { accessTokenMiddleware } from "../../../users/infrastructure/http/middlewares/access-token.middleware.js";

export function buildCategoryRouter() {
  const router = Router();
  const createController = container.resolve(CreateCategoryController);

  router.post(
    "/",
    accessTokenMiddleware(),
    (request, response) => createController.handle(request, response)
  );

  return router;
}
