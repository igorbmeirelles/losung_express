import { Router } from "express";
import { container } from "../../../container.js";
import { CreateCategoryController } from "./create-category.controller.js";
import { accessTokenMiddleware } from "../../../users/infrastructure/http/middlewares/access-token.middleware.js";
import { ListCategoriesController } from "./list-categories.controller.js";

export function buildCategoryRouter() {
  const router = Router();
  const createController = container.resolve(CreateCategoryController);
  const listController = container.resolve(ListCategoriesController);

  router.post(
    "/",
    accessTokenMiddleware(),
    (request, response) => createController.handle(request, response)
  );

  router.get(
    "/",
    accessTokenMiddleware(),
    (request, response) => listController.handle(request, response)
  );

  return router;
}
