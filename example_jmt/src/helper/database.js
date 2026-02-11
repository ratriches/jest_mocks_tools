const mongoose = require('mongoose');
const env = require('../config/environments');

const Connected = 'connected';
const Open = 'open';
const Disconnected = 'disconnected';
const Reconnected = 'reconnected';
const Disconnecting = 'disconnecting';
const Close = 'close';

const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

const aux = {
  sts: Disconnected,
  connected: false,
  open: false,
};

const con_ok = () => {
  return aux.connected && aux.sts;
};

const setStatus = (sts, connected) => {
  aux.sts = sts;
  aux.connected = connected;
  if (process.env.NODE_ENV === 'development') {
    console.log(`${green}>>> Mongo Status:${reset} ${sts}`);
  }
};

mongoose.connection.on('connected', () => {
  setStatus(Connected, true);
});
mongoose.connection.on('open', () => {
  setStatus(Open, true);
});
mongoose.connection.on('disconnected', () => {
  setStatus(Disconnected, false);
});
mongoose.connection.on('reconnected', () => {
  setStatus(Reconnected, true);
});
mongoose.connection.on('disconnecting', () => {
  setStatus(Disconnecting, false);
});
mongoose.connection.on('close', () => {
  setStatus(Close, true);
});

const options = {
  // useNewUrlParser: true, // removes a deprecation warning when connecting
  // useUnifiedTopology: true, // removes a deprecating warning when connecting
  //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
  //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
};

/**
 * Inicializar MongoDB com Mongoose
 * @returns {Promise<void>}
 */
const initMongoDB = async () => {
  try {
    const uri = env.mongodb.uri;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${green}>>> Connecting to Mongo uri:${reset} ${uri}`);
    }
    
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, options);
    mongoose.Promise = global.Promise;
    console.log(`${green}✓ MongoDB conectado via Mongoose${reset}`);
  } catch (error) {
    console.error(`${red}Erro ao conectar ao MongoDB:${reset}`, error);
  }
};

/**
 * Verifica conexão com MongoDB
 * @returns {Promise<Boolean>} Status da conexão
 */
const checkConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.admin().ping();
    return true;
  }
  return false;
};

module.exports = {
  mongoose,
  con_ok,
  initMongoDB,
  checkConnection,
  dbSts: {
    Connected,
    Open,
    Disconnected,
    Reconnected,
    Disconnecting,
    Close,
  },
};
