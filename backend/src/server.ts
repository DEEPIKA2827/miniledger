import { buildApp } from './app';

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const app = buildApp();

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`\n🚀 MiniLedger Server listening at ${address}`);
    console.log(`🔍 Health check available at: ${address}/health\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
