import { Router } from "express";
import { buildSignupRouter } from "../users/infrastructure/http/signup.router.js";
import { buildLoginRouter } from "../users/infrastructure/http/login.router.js";
import { buildLogoutRouter } from "../users/infrastructure/http/logout.router.js";
import { buildHasCompanyRouter } from "../users/infrastructure/http/has-company.router.js";

export function buildRoutes() {
  const router = Router();

  router.use("/signup", buildSignupRouter());
  router.use("/login", buildLoginRouter());
  router.use("/logout", buildLogoutRouter());
  router.use("/users/has-company", buildHasCompanyRouter());

  return router;
}
