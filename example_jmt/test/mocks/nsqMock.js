const mockData = {
  pub: {},
  readers: {},
  pubFinish: {},
  pubRequeue: {},
  showDebug: false,
};

jest.mock('nsqjs', () => {
  const originalModule = jest.requireActual('nsqjs');
  return {
    ...originalModule,
    Writer: jest.fn((host, port) => {
      if (mockData.showDebug) console.log('\x1b[35mnsqMock Writer:\x1b[0m', host, port);
      return {
        connect: jest.fn(() => {
          if (mockData.showDebug) console.log('\x1b[35mnsqMock Writer connect\x1b[0m');
          return;
        }),
        on: jest.fn((a, cb) => {
          if (mockData.showDebug) console.log('\x1b[35mnsqMock Writer on:\x1b[0m', a);
          if (a == 'ready') cb();
          return;
        }),
        publish: jest.fn(mockPublish.publish),
      };
    }),
    Reader: jest.fn((topic, channel, options) => {
      if (mockData.showDebug) console.log('\x1b[35mnsqMock Reader:', topic, channel, options);
      const reader = {
        connect: jest.fn(() => {
          if (mockData.showDebug) console.log('\x1b[35mnsqMock Reader connect\x1b[0m');
          return;
        }),
        on: jest.fn((a, cb) => {
          if (mockData.showDebug) console.log('\x1b[35mnsqMock Reader on:\x1b[0m', a);
          if (a == 'ready') cb();
          else if (a == 'message') {
            reader.onMessage = cb;
          }
          return;
        }),
      };
      if (!mockData.readers[topic]) {
        mockData.readers[topic] = {};
      }
      mockData.readers[topic].reader = reader;
      mockData.pubFinish[topic] = null;
      mockData.pubRequeue[topic] = null;
      return reader;
    }),
  };
});

const mockPublish = {
  /* NOTE: com async/await eh possivel ter controle de fluxo nos testes
   * no driver real o retorno do publish eh void
   */
  publish: /* async */ (a, b) => {
    if (mockData.showDebug) console.log('\x1b[35mnsq publish\x1b[0m', a, b);
    if (!mockData.pub[a]) mockData.pub[a] = [];
    mockData.pub[a].push(b);
    if (mockData.showDebug) console.log('\x1b[35mnsq mockData.pub\x1b[0m', mockData.pub);
    if (mockData.readers[a]) {
      /* await */ mockData.readers[a]?.reader.onMessage({
        json: () => {
          return b;
        },
        finish: () => {
          mockData.pubFinish[a] = b;
          if (mockData.showDebug) console.log('\x1b[35mnsq message finished\x1b[0m', a, b);
          return;
        },
        requeue: () => {
          mockData.pubRequeue[a] = b;
          if (mockData.showDebug) console.log('\x1b[35mnsq message requeued\x1b[0m', a, b);
          return;
        },
      });
    }
    return;
  },
};

const doBefore = () => {
  mockData.pub = {};
};

const doAfter = () => {
  expect(mockData.pub).toEqual({});
};

const clear = (n) => {
  // n = 'pub' | 'readers'
  if (mockData[n]) mockData[n] = {};
};

const get = (n) => {
  if (mockData[n]) return mockData[n];
  return undefined;
};

const setShowDebug = (onOff) => {
  mockData.showDebug = onOff;
};

const getFinished = (topic, clear) => {
  const ret = mockData.pubFinish[topic];
  if (clear) mockData.pubFinish[topic] = null;
  return ret;
};

const getRequeued = (topic, clear) => {
  const ret = mockData.pubRequeue[topic];
  if (clear) mockData.pubRequeue[topic] = null;
  return ret;
};

module.exports = {
  doBefore,
  doAfter,
  clear,
  get,
  setShowDebug,
  getFinished,
  getRequeued,
};
