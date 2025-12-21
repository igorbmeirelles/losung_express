import { Router } from "express";
import { container } from "../../../container.js";
import { LoginController } from "./login.controller.js";

export function buildLoginRouter() {
  const router = Router();
  const controller = container.resolve(LoginController);

  router.post("/", (request, response) => controller.handle(request, response));

  return router;
}
