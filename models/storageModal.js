const mongoose = require('mongoose');
// const { update } = require('./UserModal');
const HttpError = require('../models/http-error');

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
      name: { type: String, required: true },
      email: { type: String, required: true },
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

// storageSchema.methods.findItem = async function (storageId, itemId) {
//   let reservedItem;

//   console.log(reservedItem);

//   try {
//     reservedItem = storage.storageItems.find(
//       (item) => item._id.toString() === itemId.toString()
//     );

//     console.log(reservedItem);
//   } catch (err) {
//     console.log(err);
//     return next(
//       new HttpError('Somthing went wrong, could not find storage item', 404)
//     );
//   }

//   if (!item) {
//     const error = new HttpError('Could not find item for provided id.', 404);
//     return next(error);
//   }
//   return item;
// };

module.exports = mongoose.model('Storage', storageSchema);
