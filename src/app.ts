import "dotenv/config";
import express from "express";
import { applicationEnvs } from "./globals/envs.js";

const app = express();

app.listen(applicationEnvs.appPort, () =>
  console.log(`Server is running on ${applicationEnvs.appPort} 🔥`)
);
