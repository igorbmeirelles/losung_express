import { Router } from "express";
import { buildSignupRouter } from "../users/infrastructure/http/signup.router.js";

export function buildRoutes() {
  const router = Router();

  router.use("/signup", buildSignupRouter());

  return router;
}
