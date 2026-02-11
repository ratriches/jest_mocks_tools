const nsq = require('nsqjs');
const env = require('../config/environments');

const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

let nsqWriter = null;
let isConnected = false;

/**
 * Inicializa o NSQ Writer
 * @returns {Promise<Object>} NSQ Writer instance
 */
const initNSQ = async () => {
  try {
    const { nsqdHost, nsqdPort } = env.nsq;
    if (!nsqdHost) return Promise.reject(new Error(`${red}NSQ Host${reset}`));
    if (!nsqdPort) return Promise.reject(new Error(`${red}NSQ Port${reset}`));
    nsqWriter = new nsq.Writer(nsqdHost, nsqdPort);

    nsqWriter.on('ready', () => {
      isConnected = true;
      console.log(`${green}✓ NSQ Writer conectado${reset}`);
    });

    nsqWriter.on('error', (err) => {
      isConnected = false;
      console.error(`${red}NSQ Writer Error:${reset}`, err);
    });

    nsqWriter.on('closed', () => {
      isConnected = false;
      console.log(`${green}✓ NSQ Writer desconectado${reset}`);
    });

    nsqWriter.connect();

    return nsqWriter;
  } catch (error) {
    console.error(`${red}Erro ao conectar ao NSQ:${reset}`, error);
    throw error;
  }
};

/**
 * Fecha a conexão com o NSQ
 * @returns {Promise<void>}
 */
const closeNSQ = async () => {
  if (nsqWriter) {
    nsqWriter.close();
    console.log(`${green}✓ NSQ Writer fechado${reset}`);
    nsqWriter = null;
    isConnected = false;
  }
};

/**
 * Check NSQ connection status
 * @returns {Boolean} Connection status
 */
const checkConnection = () => isConnected;

/**
 * Publica mensagem no NSQ
 * @param {String} topic - Tópico
 * @param {String|Object} data - Dados a serem publicados
 * @returns {void}
 */
const publish = (topic, data) => {
  if (!nsqWriter) {
    throw new Error(`${red}NSQ writer not initialized${reset}`);
  }

  nsqWriter.publish(topic, data);
};

const createReader = (topic, channel, options) => {
  const optionsClient = options || {};

  const propsConnector = {
    lookupdHTTPAddresses: `${env.nsq.nsqlookupdHost}:${env.nsq.nsqlookupdPort}`,
    nsqdTCPAddresses: `${env.nsq.nsqdHost}:${env.nsq.nsqdPort}`,
    maxInFlight: optionsClient.maxInFlight || 2,
    maxAttempts: optionsClient.maxAttempts || 3,
    requeueDelay: optionsClient.requeueDelay || 1800000,
    messageTimeout: optionsClient.messageTimeout || 60000,
  };

  return new nsq.Reader(topic, channel, propsConnector);
};

module.exports = {
  initNSQ,
  closeNSQ,
  checkConnection,
  publish,
  createReader,
};
