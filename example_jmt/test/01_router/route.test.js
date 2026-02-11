// NOTE: para funcionar corretamente, precisa estar aqui
jest.useFakeTimers({ advanceTimers: true, doNotFake: ['nextTick', 'setImmediate', 'setInterval', 'setTimeout'] });

const dbHandler = require('../helpers/database');
const ioRM = require('../mocks/ioRedisMock');
const nsM = require('../mocks/nsqMock');
const expHlp = require('../helpers/expressHelper');
const fM = require('../mocks/fetchMock');

const nsqHelper = require('../../src/helper/helperNsq');
const dbModel = require('../../src/model/model');
const { sleep } = require('../libs/sleep');

const mut = require('../../src/route/route');

const defaultTime = '2026-02-28T10:00:00.000Z';
const dflTraceid = 'db02daeb-18a2-412c-947c-3d92736eb242';
const auth_token1 = '449c93f0-7c41-4783-b4fa-655c847511eb';

// ativa logs de debug do nsqHelper
// nsM.setShowDebug(true);

expHlp.setRoute(mut);

let msgNsq = null;

const initNsqReader = () => {
  const reader = nsqHelper.createReader('test_topic', 'test_jmt_channel', {
    maxInFlight: 5,
    maxAttempts: 5,
    requeueDelay: 60000,
    messageTimeout: 30000,
  });
  reader.connect();
  reader.on('message', (msg) => {
    msgNsq = msg.json();
    console.log('\x1b[35minitNsqReader received message:\x1b[0m', msg.json());
    msg.finish();
  });

  reader.on('ready', () => {
    console.log('test_jmt started');
  });

  reader.on('not_ready', () => {
    console.log('test_jmt not_ready');
  });

  reader.on('discard', (msg) => {
    console.warn('test_jmt discard', msg.json());
  });

  reader.on('error', (error) => {
    console.error('test_jmt error', error);
  });

  reader.on('nsqd_connected', () => {
    console.log('test_jmt nsqd_connected');
  });

  reader.on('nsqd_closed', () => {
    console.warn('test_jmt nsqd_closed');
  });
};

beforeAll(async () => {
  mongoose = await dbHandler.connect();
  await ioRM.connect();
  await nsqHelper.initNSQ();
  initNsqReader();
});

afterAll(async () => {
  await expHlp.close();
  await dbHandler.disconnect();
  jest.useRealTimers();
});

describe('route tests', () => {
  beforeEach(async () => {
    ioRM.doBefore();
    nsM.doBefore();
    fM.clearFetchState();
    jest.setSystemTime(new Date(defaultTime));
  });

  afterEach(async () => {
    ioRM.doAfter();
    nsM.doAfter();
    fM.checkFetchState();
    await dbHandler.clearDatabase();
  });

  test('test route GET /', async () => {
    const headersG = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const urlG = `/`;

    const res = await expHlp.doGet(urlG, headersG);

    expect(res.body).toEqual({
      success: true,
      data: {
        service: 'example_jmt',
        status: 'running',
        timestamp: defaultTime,
      },
      cookie: headersG.find((h) => h.key === 'cookie').val,
      traceid: headersG.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    expect(fM.getFetchState().headers).toEqual([]);
    expect(fM.getFetchState().req).toEqual([]);
    // fM.clearFetchState();
  });

  test('test route GET /health', async () => {
    const headersG = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const urlG = `/health`;

    const res = await expHlp.doGet(urlG, headersG);

    expect(res.body).toEqual({
      success: true,
      data: {
        services: {
          redis: true,
          mongodb: true,
          nsq: true,
        },
        status: 'healthy',
        timestamp: defaultTime,
      },
      cookie: headersG.find((h) => h.key === 'cookie').val,
      traceid: headersG.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    expect(fM.getFetchState().headers).toEqual([]);
    expect(fM.getFetchState().req).toEqual([]);
    // fM.clearFetchState();
  });

  test('test route GET /test_fetch', async () => {
    const retFetchBody = { success: true, data: { test: 'fetch works' } };
    fM.setRetBody(retFetchBody);

    const headersG = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const urlG = `/test_fetch`;

    const res = await expHlp.doGet(urlG, headersG);

    expect(res.body).toEqual({
      success: true,
      data: {
        json: {
          data: { test: 'fetch works' },
          success: true,
        },
        message: 'Test test_fetch route is working!',
      },
      cookie: headersG.find((h) => h.key === 'cookie').val,
      traceid: headersG.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    expect(fM.getFetchState().headers).toEqual([
      {
        credentials: 'include',
        headers: {
          authorization: 'Basic dXNlcjpwYXNzd29yZA==',
        },
        method: 'GET',
        signal: {},
      },
    ]);
    expect(fM.getFetchState().req).toEqual(['http://localhost:3000/health']);
    fM.clearFetchState();
  });

  test('test route GET /test_fetch_error', async () => {
    const retFetchBody = { success: true, data: { test: 'fetch fail' } };
    fM.setRetBody(retFetchBody);

    const headersG = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const urlG = `/test_fetch_error`;

    const res = await expHlp.doGet(urlG, headersG);

    expect(res.body).toEqual({
      success: true,
      data: {
        json: {
          data: { test: 'fetch fail' },
          success: true,
        },
        message: 'Test test_fetch_error route is working!',
      },
      cookie: headersG.find((h) => h.key === 'cookie').val,
      traceid: headersG.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    expect(fM.getFetchState().headers).toEqual([
      {
        credentials: 'include',
        headers: {
          authorization: 'Basic dXNlcjpwYXNzd29yZA==',
        },
        method: 'GET',
        signal: {},
      },
    ]);
    expect(fM.getFetchState().req).toEqual(['http://localhost:3000/invalid_endpoint']);
    fM.clearFetchState();
  });

  test('test route POST /redis/set', async () => {
    const headersP = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const body = {
      key: 'keyredis',
      value: 'keyValue',
    };
    const urlP = `/redis/set`;

    const res = await expHlp.doPost(urlP, body, headersP);

    expect(res.body).toEqual({
      success: true,
      data: {
        message: "Key 'keyredis' set in Redis",
      },
      cookie: headersP.find((h) => h.key === 'cookie').val,
      traceid: headersP.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    expect(ioRM.get('cmd_set')).toEqual({
      data: ['keyValue'],
      key: ['keyredis'],
    });
    ioRM.clear('cmd_set');
  });

  test('test route Get /redis/get', async () => {
    ioRM.mock.mior.set('keyredis', 'keyValue');
    ioRM.clear('cmd_set'); // limpar cmd_set para não interferir na validação do cmd_get

    const headersP = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const urlP = `/redis/get?key=keyredis`;

    const res = await expHlp.doGet(urlP, headersP);

    expect(res.body).toEqual({
      success: true,
      data: {
        key: 'keyredis',
        value: 'keyValue',
      },
      cookie: headersP.find((h) => h.key === 'cookie').val,
      traceid: headersP.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    expect(ioRM.get('cmd_get')).toEqual({
      key: ['keyredis'],
    });
    ioRM.clear('cmd_get');
  });

  test('test route POST /mongo/insert', async () => {
    const headersP = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const body = {
      field1: 'value 1',
      field2: 'value 2',
    };
    const urlP = `/mongo/insert`;

    const res = await expHlp.doPost(urlP, body, headersP);

    const insDoc = {
      __v: 0,
      _id: expect.any(mongoose.Types.ObjectId),
      createdAt: expect.any(Date),
      field1: 'value 1',
      field2: 'value 2',
    };
    expect(res.body).toEqual({
      success: true,
      data: {
        insertedId: expect.any(String),
        document: {
          ...insDoc,
          _id: expect.any(String),
          createdAt: expect.any(String),
        },
      },
      cookie: headersP.find((h) => h.key === 'cookie').val,
      traceid: headersP.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    const docs = await dbModel.findDocuments();
    expect(docs).toEqual([insDoc]);
  });

  test('test route GET /mongo/find', async () => {
    const insDoc = {
      field1: 'value 1',
      field2: 'value 2',
    };

    await dbModel.insertDocument(insDoc);

    const headersG = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];

    const urlG = `/mongo/find`;

    const res = await expHlp.doGet(urlG, headersG);

    expect(res.body).toEqual({
      success: true,
      data: {
        count: 1,
        documents: [
          {
            __v: 0,
            _id: expect.any(String),
            createdAt: expect.any(String),
            ...insDoc,
          },
        ],
      },
      cookie: headersG.find((h) => h.key === 'cookie').val,
      traceid: headersG.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);
  });

  test('test route POST /nsq/publish', async () => {
    const headersP = [
      { key: 'traceid', val: dflTraceid },
      { key: 'cookie', val: `auth_token=${auth_token1};other_cookie=other_value` },
    ];
    const body = {
      topic: 'test_topic',
      message: {
        val: 'value 2',
      },
    };
    const urlP = `/nsq/publish`;

    const res = await expHlp.doPost(urlP, body, headersP);

    expect(res.body).toEqual({
      success: true,
      data: { message: 'Message published to NSQ' },
      cookie: headersP.find((h) => h.key === 'cookie').val,
      traceid: headersP.find((h) => h.key === 'traceid').val,
    });
    expect(res.status).toEqual(200);

    // nsq eh assincrono, entao precisamos esperar um pouco para garantir que a mensagem foi processada pelo reader
    const retProc = await new Promise(async (res, rej) => {
      let tryes = 10;
      while (!msgNsq && tryes > 0) {
        tryes -= 1;
        await sleep(100);
      }
      if (msgNsq) {
        res(msgNsq);
      } else {
        rej(new Error('timeout waiting for msgNsq'));
      }
    });

    expect(msgNsq).toEqual(body.message);

    const nsqData = nsM.get('pub');
    expect(nsqData).toEqual({
      test_topic: [body.message],
    });
    nsM.clear('pub');
  });
});
