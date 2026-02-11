// NOTE: por algum motivo o 'globalThis.__MONGOD__' nao fica visivel no teste em 'watchAll'
console.log(`process.env.MONGO_URI`, process.env.MONGO_URI);

describe('describe demo', () => {
  test('test demo', async () => {
    expect(true).toEqual(true);
  });
});
