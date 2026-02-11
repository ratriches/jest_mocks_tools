const model = require('../model/model');
const database = require('../helper/database');
const helperNsq = require('../helper/helperNsq');
const helperRedis = require('../helper/helperRedis');

/**
 * Define um valor no Redis
 * @param {String} key - Chave
 * @param {String} value - Valor
 * @returns {Promise<void>}
 */
const setRedisValue = async (key, value) => {
  return await helperRedis.set(key, value);
};

/**
 * Obtém um valor do Redis
 * @param {String} key - Chave
 * @returns {Promise<String>} Valor
 */
const getRedisValue = async (key) => {
  return await helperRedis.get(key);
};

/**
 * Verifica conexão com Redis
 * @returns {Promise<Boolean>} Status da conexão
 */
const checkRedisConnection = async () => {
  return await helperRedis.checkConnection();
};

/**
 * Publica mensagem no NSQ
 * @param {String} topic - Tópico
 * @param {String|Object} message - Mensagem
 * @returns {void}
 */
const publishToNsq = (topic, message) => {
  return helperNsq.publish(topic, message);
};

/**
 * Verifica conexão com NSQ
 * @returns {Boolean} Status da conexão
 */
const checkNsqConnection = () => {
  return helperNsq.checkConnection();
};

/**
 * Insere um documento no MongoDB
 * @param {Object} data - Dados a serem inseridos
 * @returns {Promise<Object>} Documento inserido
 */
const insertDocument = async (data) => {
  return await model.insertDocument(data);
};

/**
 * Busca documentos no MongoDB
 * @param {Number} limit - Limite de documentos
 * @returns {Promise<Array>} Lista de documentos
 */
const findDocuments = async (limit) => {
  return await model.findDocuments(limit);
};

/**
 * Verifica conexão com MongoDB
 * @returns {Promise<Boolean>} Status da conexão
 */
const checkMongoConnection = async () => {
  return await database.checkConnection();
};

module.exports = {
  setRedisValue,
  getRedisValue,
  checkRedisConnection,
  publishToNsq,
  checkNsqConnection,
  insertDocument,
  findDocuments,
  checkMongoConnection,
};
