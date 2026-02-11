// NOTE: workaround devido a mock em testes
const setTimeoutBK = setTimeout;

const sleep = async (ms, cb) => {
  if (!ms) return;
  await new Promise((res) => {
    setTimeoutBK(async () => {
      if (cb) {
        await cb();
      }
      res();
    }, ms);
  });
};

module.exports = { sleep };
