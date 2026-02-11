const dbredis = {
  cmd_get: {},
  cmd_set: {},
  cmd_del: {},
  cmd_setex: {},
  cmd_hdel: {},
  cmd_hget: {},
  cmd_hgetall: {},
  cmd_expire: {},
  cmd_hset: {},
};
const mock = {};

jest.mock('ioredis', () =>
  jest.fn(() => {
    // console.log(`mockredis`, );
    const ioredismock = require('ioredis-mock');
    // console.log(`ioredismock`, ioredismock);
    const mio = new ioredismock();
    // console.log(`mio`, mio);
    mock.mior = {
      ...mio, // demais comandos
      get: async (k, cb) => {
        // console.log(`get:`, k);
        if (!dbredis.cmd_get.key) dbredis.cmd_get.key = [];
        dbredis.cmd_get.key.push(k);
        if (dbredis.cmd_get?.cmd_get_Fail) {
          const err = dbredis.cmd_get.cmd_get_Fail;
          delete dbredis.cmd_get.cmd_get_Fail;
          return cb && cb(err, null);
        }
        const ret = cb ? await mio.get(k, cb) : await mio.get(k);
        return ret;
      },
      set: async (k, d, cb) => {
        // console.log(`set:`, k, d);
        if (!dbredis.cmd_set.key) dbredis.cmd_set.key = [];
        dbredis.cmd_set.key.push(k);
        if (!dbredis.cmd_set.data) dbredis.cmd_set.data = [];
        dbredis.cmd_set.data.push(d);
        const ret = cb ? await mio.set(k, d, cb) : await mio.set(k, d);
        return ret;
      },
      del: async (k, cb) => {
        // console.log(`del:`, k);
        if (!dbredis.cmd_del.key) dbredis.cmd_del.key = [];
        dbredis.cmd_del.key.push(k);
        const ret = cb ? await mio.del(k, cb) : await mio.del(k);
        return ret;
      },
      hdel: async (k, d, cb) => {
        // console.log(`hdel:`, k, d);
        if (!dbredis.cmd_hdel.key) dbredis.cmd_hdel.key = [];
        dbredis.cmd_hdel.key.push(k);
        if (!dbredis.cmd_hdel.data) dbredis.cmd_hdel.data = [];
        dbredis.cmd_hdel.data.push(d);
        // console.log(`hdel:`, dbredis.cmd_hget);
        if (dbredis.cmd_hdel?.Failkey?.includes(d)) {
          const err = dbredis.cmd_hdel.Failkey.shift();
          return cb && cb(`Error: ${err}`, null);
        }
        if (dbredis.cmd_hdel?.cmd_hdel_Fail) {
          const err = dbredis.cmd_hdel.cmd_hdel_Fail;
          delete dbredis.cmd_hdel.cmd_hdel_Fail;
          return cb && cb(err, null);
        }
        const ret = cb ? await mio.hdel(k, d, cb) : await mio.hdel(k, d);
        // console.log(`hdel ret:`, k, d, ret);
        return ret;
      },
      hget: async (k, d, cb) => {
        // console.log(`hget:`, k, d);
        if (!dbredis.cmd_hget.key) dbredis.cmd_hget.key = [];
        dbredis.cmd_hget.key.push(k);
        if (!dbredis.cmd_hget.data) dbredis.cmd_hget.data = [];
        dbredis.cmd_hget.data.push(d);
        // console.log(`hget:`, dbredis.cmd_hget);
        if (dbredis.cmd_hget?.Failkey?.includes(d)) {
          const err = dbredis.cmd_hget.Failkey.shift();
          return cb && cb(`Error: ${err}`, null);
        }
        if (dbredis.cmd_hget?.cmd_hget_Fail) {
          const err = dbredis.cmd_hget.cmd_hget_Fail;
          delete dbredis.cmd_hget.cmd_hget_Fail;
          return cb && cb(err, null);
        }
        const ret = cb ? await mio.hget(k, d, cb) : await mio.hget(k, d);
        // console.log(`mio.hget(k, d, cb)`, ret);
        return ret;
      },
      // hset2: /* async */ (k, p2, p3, cb) => { // teste
      //   console.log(`hset2:`, k, p2, p3);
      //   const ret = 0;
      //   console.log(`mio.hset2(k, p2, p3, cb)`, k, p2, p3, ret);
      // },
      hset: async (k, p2, p3, cb) => {
        // console.log(`hset:`, k, p2, p3);
        if (!dbredis.cmd_hset.key) dbredis.cmd_hset.key = [];
        dbredis.cmd_hset.key.push(k);
        if (!dbredis.cmd_hset.dataP2) dbredis.cmd_hset.dataP2 = [];
        dbredis.cmd_hset.dataP2.push(p2);
        if (!dbredis.cmd_hset.dataP3) dbredis.cmd_hset.dataP3 = [];
        dbredis.cmd_hset.dataP3.push(p3);
        const ret = cb ? await mio.hset(k, p2, p3, cb) : await mio.hset(k, p2, p3);
        // console.log(`mio.hset ret (k, p2, p3, cb)`, k, p2, p3, ret);
        return ret;
      },
      hgetall: async (k, cb) => {
        // NOTE: redis retorna {} qdo nao tem dados no hgetall
        // console.log(`hgetall:`, k);
        if (!dbredis.cmd_hgetall.key) dbredis.cmd_hgetall.key = [];
        dbredis.cmd_hgetall.key.push(k);
        if (dbredis.cmd_hgetall?.cmd_hgetall_Fail) {
          const err = dbredis.cmd_hgetall.cmd_hgetall_Fail;
          delete dbredis.cmd_hgetall.cmd_hgetall_Fail;
          return cb && cb(err, null);
        }
        const ret = cb ? await mio.hgetall(k, cb) : await mio.hgetall(k);
        return ret;
      },
      setex: async (k, t, d, cb) => {
        // console.log(`setex:`, k, t, d);
        // console.log(`setex:`, k, t, d, dbredis.cmd_setex);
        if (!dbredis.cmd_setex.key) dbredis.cmd_setex.key = [];
        dbredis.cmd_setex.key.push(k);
        if (!dbredis.cmd_setex.ttl) dbredis.cmd_setex.ttl = [];
        dbredis.cmd_setex.ttl.push(t);
        if (!dbredis.cmd_setex.data) dbredis.cmd_setex.data = [];
        dbredis.cmd_setex.data.push(d);
        if (dbredis.cmd_setex?.cmd_setex_Fail) {
          const err = dbredis.cmd_setex.cmd_setex_Fail;
          delete dbredis.cmd_setex.cmd_setex_Fail;
          return cb && cb(err, null);
        }
        if (dbredis.cmd_setex.cmd_setex_Throw) {
          // console.log(` throw`);
          const cpy = dbredis.cmd_setex.cmd_setex_Throw;
          delete dbredis.cmd_setex.cmd_setex_Throw;
          throw new Error(cpy);
          // return /* await */ Promise.reject(new Error(cpy))
          // return await Promise.reject(new Error(cpy))
        }
        const ret = cb ? await mio.setex(k, t, d, cb) : await mio.setex(k, t, d);
        // console.log(`setex ret:`, k, t, d, ret);
        return ret;
      },
      expire: async (k, d, cb) => {
        // console.log(`expire:`, k, d);
        if (!dbredis.cmd_expire.key) dbredis.cmd_expire.key = [];
        dbredis.cmd_expire.key.push(k);
        if (!dbredis.cmd_expire.data) dbredis.cmd_expire.data = [];
        dbredis.cmd_expire.data.push(d);
        if (dbredis.cmd_expire?.Failkey?.includes(d)) {
          const err = dbredis.cmd_expire.Failkey.shift();
          return cb && cb(`Error: ${err}`, null);
        }
        if (dbredis.cmd_expire?.cmd_expire_Fail) {
          const err = dbredis.cmd_expire.cmd_expire_Fail;
          delete dbredis.cmd_expire.cmd_expire_Fail;
          return cb && cb(err, null);
        }
        const ret = cb ? await mio.expire(k, d, cb) : await mio.expire(k, d);
        return ret;
      },
      on: (_evt, _cb) => {
        // console.log(`ioredis on:`, _evt);
        return mio.on(_evt, _cb);
      },
      monitor: (_cb) => {
        // console.log(`monitor:`, _cb);
      },
    };
    return mock.mior;
  })
);

const redisHlp = require('../../src/helper/helperRedis');
const { sleep } = require('../libs/sleep');

const doFlushDb = () => mock.mior.flushdb('SYNC', () => {});

const doBefore = () => {
  dbredis.cmd_get = {};
  dbredis.cmd_set = {};
  dbredis.cmd_del = {};
  dbredis.cmd_setex = {};
  dbredis.cmd_hdel = {};
  dbredis.cmd_hget = {};
  dbredis.cmd_hgetall = {};
  dbredis.cmd_expire = {};
  dbredis.cmd_hset = {};
  doFlushDb();
  // console.log(`doBefore ioRedisMock`);
};

const doAfter = () => {
  // console.log(`doAfter ioRedisMock`);
  expect(dbredis.cmd_get).toEqual({});
  expect(dbredis.cmd_set).toEqual({});
  expect(dbredis.cmd_del).toEqual({});
  expect(dbredis.cmd_setex).toEqual({});
  expect(dbredis.cmd_hdel).toEqual({});
  expect(dbredis.cmd_hget).toEqual({});
  expect(dbredis.cmd_hgetall).toEqual({});
  expect(dbredis.cmd_expire).toEqual({});
  expect(dbredis.cmd_hset).toEqual({});
};

const clear = (n) => {
  // console.log(`clear ioRedisMock`, n);
  if (dbredis[n]) dbredis[n] = {};
};

const get = (n) => {
  // console.log(`get ioRedisMock`, n);
  if (n === 'all') return dbredis;
  if (dbredis[n]) return dbredis[n];
  return undefined;
};

const connect = async () => {
  await redisHlp.initRedis();
  let cnt = 2000;
  while (cnt > 0 && !redisHlp.isConnected()) {
    cnt--;
    await sleep(1);
  }
  if (cnt === 0) {
    expect(redisHlp.isConnected()).toEqual('FAIL Redis connected');
  }
};

module.exports = {
  redisHlp,
  connect,
  mock,
  doBefore,
  doAfter,
  doFlushDb,
  clear,
  get,
};
