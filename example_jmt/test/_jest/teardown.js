const { sleep } = require('../libs/sleep');

module.exports = async function () {
  console.log('\x1b[32m>Jest Tear Down\x1b[0m');

  await sleep(100);
  console.log(`\x1b[32m>>Close Mongo uri:\x1b[0m ${globalThis.__MONGOD__.getUri()}`);
  await globalThis.__MONGOD__.stop();
  await sleep(100);

  console.log('\x1b[32m>Jest Tear Down End\x1b[0m');
};
