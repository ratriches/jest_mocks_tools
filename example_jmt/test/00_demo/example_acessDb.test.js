// NOTE: este teste é apenas um exemplo de como acessar o banco de dados,
// não tem nenhuma lógica de negócio implementada, apenas um teste de conexão com o banco de dados, para servir de base para os próximos testes que serão implementados

const dbHandler = require('../helpers/database');

jest.setTimeout(20000);

beforeAll(async () => {
  console.log(`connecting to DB`);
  /* mongoose = */ await dbHandler.connect();
  console.log(`connected to DB`);
});

afterAll(async () => {
  console.log(`closing to DB`);
  await dbHandler.disconnect();
  console.log(`closed to DB`);
});

describe('database tests', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  test('fake success test', async () => {
    expect(true).toEqual(true);
  });
});
