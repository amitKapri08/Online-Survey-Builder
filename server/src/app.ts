import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./utils/AppError.js";
import { env } from "./config/env.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use("/api", apiRoutes);

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404));
});

app.use(errorHandler);

export default app;
