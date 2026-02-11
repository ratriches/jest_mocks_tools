const Redis = require('ioredis');
const env = require('../config/environments');

const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

let redisClient = null;
let isConnected = false;

/**
 * Inicializa o cliente Redis
 * @returns {Promise<Object>} Redis Client instance
 */
const initRedis = async () => {
  try {
    if (redisClient) return redisClient;

    const { host, port } = env.redis;
    if (!host) return Promise.reject(new Error(`${red}Redis Host${reset}`));
    if (!port) return Promise.reject(new Error(`${red}Redis Port${reset}`));
    redisClient = new Redis({ host, port });

    redisClient.on('error', (err) => {
      isConnected = false;
      console.error(`${red}Redis Client Error:${reset}`, err);
    });
    redisClient.on('ready', () => {
      isConnected = true;
      console.log(`${green}✓ Redis ready${reset}`);
    });
    redisClient.on('closed', () => {
      isConnected = false;
      console.log(`${green}✓ Redis closed${reset}`);
    });

    return redisClient;
  } catch (error) {
    console.error(`${red}Erro ao conectar ao Redis:${reset}`, error);
    throw error;
  }
};

/**
 * Fecha a conexão com o Redis
 * @returns {Promise<void>}
 */
const closeRedis = async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log(`${green}✓ Redis desconectado${reset}`);
    redisClient = null;
    isConnected = false;
  }
};

/**
 * Obtém a instância atual do Redis Client
 * @returns {Object|null} Redis Client instance
 */
const getRedisClient = () => redisClient;

/**
 * Define um valor no Redis
 * @param {String} key - Chave
 * @param {String} value - Valor
 * @returns {Promise<void>}
 */
const set = async (key, value) => {
  if (!redisClient) {
    throw new Error(`${red}Redis client not initialized${reset}`);
  }
  await redisClient.set(key, value);
};

/**
 * Obtém um valor do Redis
 * @param {String} key - Chave
 * @returns {Promise<String>} Valor
 */
const get = async (key) => {
  if (!redisClient) {
    throw new Error(`${red}Redis client not initialized${reset}`);
  }
  return await redisClient.get(key);
};

/**
 * Verifica conexão com Redis
 * @returns {Promise<Boolean>} Status da conexão
 */
const checkConnection = async () => {
  if (redisClient && isConnected === true) {
    await redisClient.ping();
    return true;
  }
  return false;
};

module.exports = {
  initRedis,
  closeRedis,
  getRedisClient,
  set,
  get,
  checkConnection,
  isConnected: () => isConnected,
};
