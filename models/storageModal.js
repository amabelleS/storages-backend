const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const storageSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // image: { type: String },
  image: { url: String, filename: String },
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

module.exports = mongoose.model('Storage', storageSchema);
