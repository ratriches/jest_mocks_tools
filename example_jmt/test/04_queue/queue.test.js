// NOTE: para funcionar corretamente, precisa estar aqui
jest.useFakeTimers({ advanceTimers: true, doNotFake: ['nextTick', 'setImmediate', 'setInterval', 'setTimeout'] });

const dbHandler = require('../helpers/database');
const ioRM = require('../mocks/ioRedisMock');
const nsM = require('../mocks/nsqMock');
const expHlp = require('../helpers/expressHelper');
const fM = require('../mocks/fetchMock');

const nsqHelper = require('../../src/helper/helperNsq');
const { sleep } = require('../libs/sleep');

const mut = require('../../src/queue/consumerNsq');

const defaultTime = '2026-02-28T10:00:00.000Z';

// ativa logs de debug do nsqHelper
nsM.setShowDebug(true); // logs do mock ativos para mapear os fluxos do nsq

let consoleLogCalls = [];
let consoleErrorCalls = [];
let consoleWarnCalls = [];

const consoleSpy = jest.spyOn(console, 'log');
const consoleErrorSpy = jest.spyOn(console, 'error');
const consoleWarnSpy = jest.spyOn(console, 'warn');

consoleSpy.mockImplementation((...args) => {
  [...args].forEach((arg) => {
    if (typeof arg === 'object') {
      try {
        consoleLogCalls.push(JSON.parse(JSON.stringify(arg)));
      } catch (error) {
        consoleLogCalls.push(arg);
      }
    } else {
      consoleLogCalls.push(arg);
    }
  });
});

consoleErrorSpy.mockImplementation((...args) => {
  [...args].forEach((arg) => {
    if (typeof arg === 'object') {
      try {
        consoleErrorCalls.push(JSON.parse(JSON.stringify(arg)));
      } catch (error) {
        consoleErrorCalls.push(arg);
      }
    } else {
      consoleErrorCalls.push(arg);
    }
  });
});

consoleWarnSpy.mockImplementation((...args) => {
  [...args].forEach((arg) => {
    if (typeof arg === 'object') {
      try {
        consoleWarnCalls.push(JSON.parse(JSON.stringify(arg)));
      } catch (error) {
        consoleWarnCalls.push(arg);
      }
    } else {
      consoleWarnCalls.push(arg);
    }
  });
});

beforeAll(async () => {
  mongoose = await dbHandler.connect();
  await ioRM.connect();
  await nsqHelper.initNSQ();
  mut.init_nsq_test_topic();
});

afterAll(async () => {
  await expHlp.close();
  await dbHandler.disconnect();
  jest.useRealTimers();
  consoleSpy.mockRestore();
  consoleErrorSpy.mockRestore();
  consoleWarnSpy.mockRestore();
});

describe('queue tests', () => {
  beforeEach(async () => {
    consoleLogCalls = [];
    consoleErrorCalls = [];
    consoleWarnCalls = [];
    ioRM.doBefore();
    nsM.doBefore();
    fM.clearFetchState();
    jest.setSystemTime(new Date(defaultTime));
  });

  afterEach(async () => {
    expect(consoleLogCalls).toEqual([]);
    expect(consoleErrorCalls).toEqual([]);
    expect(consoleWarnCalls).toEqual([]);
    ioRM.doAfter();
    nsM.doAfter();
    fM.checkFetchState();
    await dbHandler.clearDatabase();
  });

  test('test publish ok', async () => {
    const msgData = { text: 'Hello, NSQ!' };

    await sleep(100); // para garantir algum processamento assincrono antes do publish
    nsqHelper.publish('test_topic', msgData);
    await sleep(100); // para garantir o processamento apos o publish

    const nsqData = nsM.get('pub');
    expect(nsqData).toEqual({
      test_topic: [msgData],
    });
    nsM.clear('pub');

    expect(consoleLogCalls).toEqual([
      '\x1b[35mnsq publish\x1b[0m',
      'test_topic',
      { text: 'Hello, NSQ!' },
      '\x1b[35mnsq mockData.pub\x1b[0m',
      { test_topic: [{ text: 'Hello, NSQ!' }] },
      'Received message from NSQ:',
      { text: 'Hello, NSQ!' },
      '\x1b[35mnsq message finished\x1b[0m',
      'test_topic',
      { text: 'Hello, NSQ!' },
    ]);
    consoleLogCalls = [];
  });
});
