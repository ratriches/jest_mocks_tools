const { TestModel } = require('./schema');

/**
 * Insere um novo documento
 * @param {Object} data - Dados a serem inseridos
 * @returns {Promise<Object>} Documento inserido
 */
const insertDocument = async (data) => {
  const doc = new TestModel(data);
  return await doc.save();
};

/**
 * Busca documentos com limite
 * @param {Number} limit - Limite de documentos
 * @returns {Promise<Array>} Lista de documentos
 */
const findDocuments = async (limit = 10) => {
  return await TestModel.find({}).limit(limit).lean();
};

module.exports = {
  insertDocument,
  findDocuments,
};
