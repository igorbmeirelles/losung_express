import { Router } from "express";
import { container } from "../../../container.js";
import { LogoutController } from "./logout.controller.js";

export function buildLogoutRouter() {
  const router = Router();
  const controller = container.resolve(LogoutController);

  router.post("/", (request, response) => controller.handle(request, response));

  return router;
}
