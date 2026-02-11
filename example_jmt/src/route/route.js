const express = require('express');
const service = require('../service/service');

const router = express.Router();

/**
 * Retorna resposta HTTP
 * @param {Object} res - Response object
 * @param {Number} code - Status code
 * @param {Object|String} data - Dados de retorno ou mensagem de erro
 */
const response = (req, res, code, data) => {
  if (process.env.NODE_ENV === 'development') {
    const reset = '\x1b[0m';
    const red = '\x1b[31m';
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const blue = '\x1b[34m';
    // const magenta = '\x1b[35m';
    const cyan = '\x1b[36m';

    // debug
    const dh = new Date(Date.now()).toLocaleString('pt-BR');
    console.log(
      `${green}##(${dh})>> ${code < 300 ? '' : red}response code:${code} of ${blue}'${req.method}: ${yellow}${req.url}'${cyan}; data:${reset}'${JSON.stringify(data)}'`,
    );
  }

  const ret = {
    success: code < 300,
  };

  if (code < 300) {
    ret.data = data;
  } else {
    ret.error = data;
  }

  if (req.headers.cookie) {
    ret.cookie = req.headers.cookie;
  }
  if (req.headers.traceid) {
    ret.traceid = req.headers.traceid;
  }

  return res.status(code).json(ret);
};

/**
 * Rota raiz
 */
router.get('/', (req, res) => {
  const ret = {
    service: 'example_jmt',
    status: 'running',
    timestamp: new Date().toISOString(),
  };
  response(req, res, 200, ret);
});

/**
 * Health check de todos os serviços
 */
router.get('/health', async (req, res) => {
  const health = {
    redis: false,
    mongodb: false,
    nsq: false,
  };

  try {
    health.redis = await service.checkRedisConnection();
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  try {
    health.mongodb = await service.checkMongoConnection();
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  try {
    health.nsq = service.checkNsqConnection();
  } catch (error) {
    console.error('NSQ health check failed:', error);
  }

  const allHealthy = health.redis && health.mongodb && health.nsq;

  response(req, res, allHealthy ? 200 : 503, {
    status: allHealthy ? 'healthy' : 'unhealthy',
    services: health,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Rota de teste para fetch
 */
router.get('/test_fetch', async (req, res) => {
  const options = {
    method: 'GET',
    credentials: 'include',
    headers: {
      authorization: `Basic ${Buffer.from('user:password').toString('base64')}`,
    },
    signal: AbortSignal.timeout(60000),
  };

  const ret = await fetch('http://localhost:3000/health', options);
  if (!ret.ok) {
    return response(req, res, ret.status, `Failed to fetch health endpoint: ${ret.statusText}`);
  }

  const json = await ret.json();
  // console.log(json, ret.status);

  response(req, res, 200, {
    message: 'Test test_fetch route is working!',
    json,
  });
});

/**
 * Rota de teste para fetch com endpoint inválido
 */
router.get('/test_fetch_error', async (req, res) => {
  const options = {
    method: 'GET',
    credentials: 'include',
    headers: {
      authorization: `Basic ${Buffer.from('user:password').toString('base64')}`,
    },
    signal: AbortSignal.timeout(60000),
  };

  const ret = await fetch('http://localhost:3000/invalid_endpoint', options);
  if (!ret.ok) {
    return response(req, res, ret.status, `Failed to fetch invalid endpoint: ${ret.statusText}`);
  }
  const json = await ret.json();
  // console.log(json, ret.status);

  response(req, res, 200, {
    message: 'Test test_fetch_error route is working!',
    json,
  });
});

/**
 * Define valor no Redis
 */
router.post('/redis/set', async (req, res) => {
  try {
    const { key, value } = req.body;
    await service.setRedisValue(key, value);
    response(req, res, 200, { message: `Key '${key}' set in Redis` });
  } catch (error) {
    response(req, res, 500, error.message);
  }
});

/**
 * Obtém valor do Redis
 */
router.get('/redis/get', async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) {
      return response(req, res, 400, 'Key parameter is required');
    }
    const value = await service.getRedisValue(key);
    response(req, res, 200, { key, value });
  } catch (error) {
    response(req, res, 500, error.message);
  }
});

/**
 * Insere documento no MongoDB
 */
router.post('/mongo/insert', async (req, res) => {
  try {
    const result = await service.insertDocument(req.body);
    response(req, res, 200, { insertedId: result._id, document: result });
  } catch (error) {
    response(req, res, 500, error.message);
  }
});

/**
 * Busca documentos do MongoDB
 */
router.get('/mongo/find', async (req, res) => {
  try {
    const documents = await service.findDocuments(10);
    response(req, res, 200, { count: documents.length, documents });
  } catch (error) {
    response(req, res, 500, error.message);
  }
});

/**
 * Publica mensagem no NSQ
 */
router.post('/nsq/publish', (req, res) => {
  try {
    const { topic, message } = req.body;
    service.publishToNsq(topic || 'test_topic', message);
    response(req, res, 200, { message: 'Message published to NSQ' });
  } catch (error) {
    response(req, res, 500, error.message);
  }
});

module.exports = router;
