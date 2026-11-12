import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { randomBytes } from "node:crypto";

import { env } from "../config/env.js";

export interface JwtPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const generateRefreshToken = (): string => {
  return randomBytes(32).toString("hex");
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
