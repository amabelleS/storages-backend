const mongoose = require('mongoose');

const Item = require('../models/itemModal');

const Schema = mongoose.Schema;

// const itemSchema = new Schema({
//   _itemId: { type: mongoose.Types.ObjectId, require: true },
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   sirialNun: Number,
//   rentCost: { type: Number, required: true },
//   qntInStock: { type: Number, default: 1 },
//   reservedStack: { type: Number, require: true },
//   creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
//   reservedBy: [
//     {
//       type: mongoose.Types.ObjectId,
//       required: true,
//       ref: 'User',
//       pickUpTime: Date,
//       name: { type: String, required: true },
//       email: { type: String, required: true },
//     },
//   ],
// });

// const incomeSchema = new Schema({
//   description: { type: String },
//   date: { type: Date, required: true },
//   amount: { type: Number, required: true },

//   user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
//   item: {
//     type: Schema.Types.ObjectId,
//     required: true,
//     ref: 'Item',
//   },
// });

const inUseCountSchema = new Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
});

const storageSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // image: { type: String },
  image: { url: String, filename: String },
  // incomes: [incomeSchema],
  totalItemsCurrentlyInUseLog: [inUseCountSchema],
  totalItemsInStockCountLog: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
    },
  ],
  incomeLog: [
    {
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
    },
  ],
  creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  admins: [{ type: Schema.Types.ObjectId, required: true, ref: 'User' }],
  activeCommunityUsers: [
    { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  ],
  storageItems: [{ type: Schema.Types.ObjectId, required: true, ref: 'Item' }],
  itemsDataPoints: [{ x: Date, y1: Number, y2: Number, date: String }],
  incomeDataPoints: [{ x: Date, y: Number }],
});

storageSchema.post('save', function (doc, next) {
  doc
    .populate('storageItems')
    .execPopulate()
    .then(function () {
      next();
    });
});

// storageSchema.post('deleteOne', async function (doc, next) {
//   if (storage.storageItems) {
//     storage.storageItems.forEach(async function (item) {
//       await cloudinary.uploader.destroy(item.image.filename);
//     });
//   }

//   next();
// });

// DELETE ALL ASSOCIATED ITEMS AFTER A STORAGE IS DELETED
// storageSchema.post('deleteOne', async function (storage) {
//   console.log('got here..........');
//   if (storage.storageItems.length) {
//     const res = await Item.remove({ _id: { $in: storage.storageItems } });
//     console.log(res);
//   }
// });

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
