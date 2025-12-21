import { Router } from "express";
import { container } from "../../../container.js";
import { SignupController } from "./signup.controller.js";

export function buildSignupRouter() {
  const router = Router();
  const controller = container.resolve(SignupController);

  router.post("/", (request, response) => controller.handle(request, response));

  return router;
}
