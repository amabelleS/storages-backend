const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const incomeSchema = new Schema({
  storage: { type: Schema.Types.ObjectId, required: true, ref: 'Storage' },
  description: { type: String },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },

  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  item: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Item',
  },
});

module.exports = mongoose.model('Income', incomeSchema);
