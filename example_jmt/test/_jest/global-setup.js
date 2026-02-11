const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  console.log('\x1b[32m>Jest Global Setup\x1b[0m');
  console.log(`\x1b[32m>>ENV:\x1b[0m ${JSON.stringify(process.env)}`);
  console.log(`\x1b[32m>>NODE_ENV:\x1b[0m ${process.env.NODE_ENV}`);

  process.env.TZ = 'UTC';

  const mongod = await MongoMemoryServer.create();
  globalThis.__MONGOD__ = mongod;
  process.env.MONGO_URI = mongod.getUri();

  console.log(`\x1b[32m>>Setup Mongo uri:\x1b[0m ${process.env.MONGO_URI}`);

  console.log('\x1b[32m>Jest Global Setup End\x1b[0m');
};
