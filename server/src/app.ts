import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import apiRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api", apiRoutes);

app.use(errorHandler);

export default app;
