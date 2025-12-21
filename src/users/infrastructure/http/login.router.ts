import { Router } from "express";
import { container } from "../../../container.js";
import { LoginController } from "./login.controller.js";
import { RefreshLoginController } from "./refresh-login.controller.js";

export function buildLoginRouter() {
  const router = Router();
  const loginController = container.resolve(LoginController);
  const refreshController = container.resolve(RefreshLoginController);

  router.post("/", (request, response) =>
    loginController.handle(request, response)
  );

  router.post("/refresh", (request, response) =>
    refreshController.handle(request, response)
  );

  return router;
}
