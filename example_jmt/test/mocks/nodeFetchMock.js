const fetchState = {
  ok: true,
  retBody: [],
  headers: [],
  req: [],
  calls: [],
};

jest.mock('node-fetch', () =>
  jest.fn((host, params) => {
    // console.log(`fetch`, host, params);
    return Promise.resolve({
      ok: fetchState.ok,
      json: () => {
        fetchState.calls.push('json');
        fetchState.req.push(host);
        fetchState.headers.push(JSON.parse(JSON.stringify(params)));
        return Promise.resolve(fetchState.retBody.shift());
      },
      arrayBuffer: () => {
        fetchState.calls.push('arrayBuffer');
        fetchState.req.push(host);
        fetchState.headers.push(JSON.parse(JSON.stringify(params)));
        return Promise.resolve(fetchState.retBody.shift());
      },
    });
  })
);

const clearFetchState = () => {
  fetchState.ok = true;
  fetchState.retBody = [];
  fetchState.headers = [];
  fetchState.req = [];
  fetchState.calls = [];
};

const checkFetchState = () => {
  expect(fetchState.ok).toEqual(true);
  expect(fetchState.retBody).toEqual([]);
  expect(fetchState.headers).toEqual([]);
  expect(fetchState.req).toEqual([]);
  expect(fetchState.calls).toEqual([]);
};

const getFetchState = () => {
  return fetchState;
};

const setRetBody = (data) => {
  fetchState.retBody.push(data);
};

module.exports = {
  clearFetchState,
  checkFetchState,
  getFetchState,
  setRetBody,
};
