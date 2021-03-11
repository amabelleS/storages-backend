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
  out: { type: Boolean, default: false },
  creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  reservedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // name: { type: String },
    // email: { type: String },
    // phoneNum: { type: Number },
    // pickUpTime: Date,
  },
  reservedByDetails: {
    name: { type: String },
    email: { type: String },
    phoneNum: { type: Number },
    facebookName: { type: String },
  },
  // image: { type: String },
  image: { url: String, filename: String },
});

module.exports = mongoose.model('Item', itemSchema);
