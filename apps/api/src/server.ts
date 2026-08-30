import { createApp } from "./app";

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = "0.0.0.0";

async function start() {
  const app = await createApp();

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();