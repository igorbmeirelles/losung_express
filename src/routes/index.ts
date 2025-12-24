import { Router } from "express";
import { buildSignupRouter } from "../users/infrastructure/http/signup.router.js";
import { buildLoginRouter } from "../users/infrastructure/http/login.router.js";
import { buildLogoutRouter } from "../users/infrastructure/http/logout.router.js";
import { buildHasCompanyRouter } from "../users/infrastructure/http/has-company.router.js";
import { buildCompanyRouter } from "../companies/infrastructure/http/company.router.js";
import { buildWarehouseRouter } from "../warehouses/infrastructure/http/warehouse.router.js";
import { buildCategoryRouter } from "../categories/infrastructure/http/category.router.js";

export function buildRoutes() {
  const router = Router();

  router.use("/signup", buildSignupRouter());
  router.use("/login", buildLoginRouter());
  router.use("/logout", buildLogoutRouter());
  router.use("/users/has-company", buildHasCompanyRouter());
  router.use("/companies", buildCompanyRouter());
  router.use("/warehouses", buildWarehouseRouter());
  router.use("/categories", buildCategoryRouter());

  return router;
}
