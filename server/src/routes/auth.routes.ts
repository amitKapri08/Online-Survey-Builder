import { Router } from "express";

import { login, logout, register } from "../controllers/auth.controller.js";
import { csrf } from "../middlewares/csrf.js";
import { originCheck } from "../middlewares/originCheck.js";
import { generateCsrfToken } from "../utils/csrf.js";
import { setCsrfCookie } from "../utils/cookies.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { refresh } from "../controllers/refresh.controller.js";

const router = Router();

router.get("/csrf", (_req, res) => {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  res.json({
    success: true,
    data: {
      csrfToken: token,
    },
  });
});

router.post(
  "/register",
  originCheck,
  authLimiter,
  csrf,
  register,
);
router.post(
  "/login",
  originCheck,
  authLimiter,
  csrf,
  login,
);
router.post(
  "/refresh",
  originCheck,
  csrf,
  refresh,
);
router.post(
  "/logout",
  originCheck,
  csrf,
  logout,
);

export default router;