const setTimeoutBK = setTimeout;

const sleep = async (ms, cb) => {
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
