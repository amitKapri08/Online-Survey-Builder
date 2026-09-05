import { env } from "./config/env.js";
import app from "./app.js";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

app.listen(env.PORT, () => {
  console.log(`Server running on PORT: ${env.PORT}`);
});
