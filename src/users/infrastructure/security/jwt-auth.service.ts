import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import { authEnvs } from "../../../globals/envs.js";
import type { AuthService } from "../../application/contracts/auth-service.js";

@injectable()
export class JwtAuthService implements AuthService {
  async signAccess(payload: Record<string, unknown>): Promise<string> {
    return jwt.sign(payload, authEnvs.jwtSecret, {
      expiresIn: authEnvs.jwtExpiresIn,
    });
  }

  async signRefresh(payload: Record<string, unknown>): Promise<string> {
    return jwt.sign(payload, authEnvs.jwtSecret, {
      expiresIn: authEnvs.refreshExpiresIn,
    });
  }
}
