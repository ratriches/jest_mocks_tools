const { mongoose } = require('../helper/database');

// Mongoose Schema/Model
const TestSchema = new mongoose.Schema(
  {
    data: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  },
  { strict: false },
);

const TestModel = mongoose.model('Test', TestSchema);

module.exports = {
  TestSchema,
  TestModel,
};
