import { Router } from "express";
import { buildSignupRouter } from "../users/infrastructure/http/signup.router.js";
import { buildLoginRouter } from "../users/infrastructure/http/login.router.js";
import { buildLogoutRouter } from "../users/infrastructure/http/logout.router.js";

export function buildRoutes() {
  const router = Router();

  router.use("/signup", buildSignupRouter());
  router.use("/login", buildLoginRouter());
  router.use("/logout", buildLogoutRouter());

  return router;
}
