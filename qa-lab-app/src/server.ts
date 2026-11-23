import { createApp } from './app.js';
import { loadBugsFromEnv } from './bugs.js';

loadBugsFromEnv(process.env.BUGS);

const port = Number(process.env.PORT ?? 3000);
const server = createApp().listen(port, () => {
  console.log(`QA Lab App em http://localhost:${port}`);
  console.log(`Documentação da API em http://localhost:${port}/api-docs`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nA porta ${port} já está em uso (provavelmente outra instância da app).`);
    console.error(`  • Veja quem está usando: lsof -nP -iTCP:${port} -sTCP:LISTEN`);
    console.error(`  • Ou suba em outra porta: PORT=3001 npm start\n`);
    process.exit(1);
  }
  throw err;
});
