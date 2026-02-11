jest.mock('uuid', () => ({
  result: {},
  v4: () => dflUuid,
}));

let dflUuid = '00000001-0002-0003-0004-123456789987';

module.exports = {
  dflUuid,
};
