const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  storage: { type: Schema.Types.ObjectId, required: true, ref: 'Storage' },
  name: { type: String, required: [true, 'item must have a name'] },
  description: { type: String, required: true },
  innerNum: { type: Number },
  rentCost: { type: Number, required: true },
  depositAmount: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  //   reservedStack: { type: Number, require: true },
  creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  reservedBy: {
    type: Schema.Types.ObjectId,
    // required: true,
    ref: 'User',
    // pickUpTime: Date,
    // name: { type: String, required: true },
    // email: { type: String, required: true },
  },
  image: { type: String },
});

module.exports = mongoose.model('Item', itemSchema);
