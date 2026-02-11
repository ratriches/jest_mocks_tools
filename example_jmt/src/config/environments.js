/**
 * Configurações da aplicação
 * Centraliza todas as variáveis de ambiente e configurações
 */

const config = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  nsq: {
    nsqdHost: process.env.NSQ_NSQD_HOST || 'localhost',
    nsqdPort: process.env.NSQ_NSQD_PORT || 4150,
    nsqlookupdHost: process.env.NSQ_NSQLOOKUPD_HOST || 'localhost',
    nsqlookupdPort: process.env.NSQ_NSQLOOKUPD_PORT || 4161,
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://admin:password@mongo:27017/example_jmt_db?authSource=admin',
  },
};

module.exports = config;
