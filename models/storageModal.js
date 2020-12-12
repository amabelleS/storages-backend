const mongoose = require('mongoose');
const { update } = require('./UserModal');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  _itemId: { type: mongoose.Types.ObjectId, require: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  rentCost: { type: Number, required: true },
  qntInStock: { type: Number, require: true },
  reservedStack: { type: Number, require: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  reservedBy: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: 'User',
      pickUpTime: Date,
    },
  ],
});

const storageSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  image: { type: String },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  admins: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
  activeCommunityUsers: [
    { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  ],
  storageItems: [itemSchema],
});

// storageSchema.methods.findItemAndReserve = function (itemId, userId) {
// const updatedItems = this.storageItems.map((item) =>
//   item._id.toString() === paramId.toString()
//     ? {
//         ...item,
//         reservedBy: reservedBy.push(userId),
//       }
//     : item
// );
// this.storageItems = updatedItems;
// };

module.exports = mongoose.model('Storage', storageSchema);
