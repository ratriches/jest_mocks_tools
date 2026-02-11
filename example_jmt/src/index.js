const express = require('express');
const routes = require('./route/route');
const helperNsq = require('./helper/helperNsq');
const helperRedis = require('./helper/helperRedis');
const database = require('./helper/database');
const { init_nsq_test_topic } = require('./queue/consumerNsq');

const app = express();
const PORT = process.env.PORT || 3000;
let server;

// Middleware
// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text());
app.use(express.raw());

// debug middleware (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  const reset = '\x1b[0m';
  // const red = '\x1b[31m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const blue = '\x1b[34m';
  // const magenta = '\x1b[35m';
  const cyan = '\x1b[36m';

  // debug
  app.use((req, _res, next) => {
    const dh = new Date(Date.now()).toLocaleString('pt-BR');
    let add = '';
    if (req.method === 'GET') add = `; query:${reset}${JSON.stringify(req.query)}`;
    else if (req.method === 'POST') add = `; body:${reset}${JSON.stringify(req.body)}`;
    const msg = `${green}##(${dh})>> acessing URL: ${blue}'${req.method}: ${yellow}${req.url}'${cyan}${add}`;
    // const msg = `##(${dh})>> acessing URL: '${req.method}: ${req.url}'${add} headers: ${JSON.stringify(req?.headers)}`;
    console.log(msg);
    next();
  });
}

// Rotas
app.use('/', routes);

// Error handler middleware (Express 5)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Inicializar aplicação
const start = async () => {
  console.log('Iniciando serviço example_jmt...');

  await helperRedis.initRedis();
  await database.initMongoDB();
  await helperNsq.initNSQ();
  init_nsq_test_topic();

  // Express 5: app.listen() agora retorna uma Promise
  server = await app.listen(PORT);
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`${signal} recebido, encerrando graciosamente...`);

  try {
    // Fechar servidor HTTP primeiro
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('✓ Servidor HTTP fechado');
    }

    // Fechar conexões
    await helperRedis.closeRedis();

    if (database.mongoose.connection.readyState === 1) {
      await database.mongoose.disconnect();
      console.log('✓ MongoDB desconectado');
    }

    await helperNsq.closeNSQ();

    console.log('Shutdown completo');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start().catch(console.error);
