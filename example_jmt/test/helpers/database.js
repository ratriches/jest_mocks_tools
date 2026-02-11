const { sleep } = require('../libs/sleep');
const env = require('../../src/config/environments');
env.mongoUrl = process.env.MONGO_URI;
const { mongoose, con_ok } = require('../../src/helper/database');

module.exports.mongoose = mongoose;
module.exports.uri = process.env.MONGO_URI;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  if (!con_ok()) {
    mongoose.set('strictQuery', false); // (node:474069) [MONGOOSE] DeprecationWarning
    await mongoose.connect(module.exports.uri);
  }

  let trys = 1000;
  while (!con_ok() && trys > 0) {
    await sleep(1);
    trys--;
  }
  // console.log(`trys`, trys);
  if (trys <= 0) {
    throw new Error('Timeout connecting to mongo');
  }
  console.log(`\x1b[32m>> Connected to Mongo uri:\x1b[0m ${env.mongoUrl}`);
  return mongoose;
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.disconnect = async () => {
  console.log(`\x1b[35m>> Disconnect from Mongo\x1b[0m`);

  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  const { collections } = mongoose.connection;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};

/**
 * list db collections.
 */
module.exports.listCollections = () => {
  const list = [];
  const { collections } = mongoose.connection;

  for (const key in collections) {
    list.push(key);
  }
  return list;
};
