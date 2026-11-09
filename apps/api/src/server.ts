import "dotenv/config";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";

async function start() {
  const env = loadEnv();
  const app = await createApp({ env });

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
