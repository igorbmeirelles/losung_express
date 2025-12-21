import "reflect-metadata";
import "dotenv/config";
import express from "express";
import { applicationEnvs } from "./globals/envs.js";
import "./container.js";
import { buildSignupRouter } from "./users/infrastructure/http/signup.router.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/signup", buildSignupRouter());

  return app;
}

export const app = createApp();

if (process.env.NODE_ENV !== "test") {
  app.listen(applicationEnvs.appPort, () =>
    console.log(`Server is running on ${applicationEnvs.appPort} 🔥`)
  );
}
