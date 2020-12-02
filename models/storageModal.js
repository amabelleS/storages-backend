const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// const itemsSchema = new Schema({
//   type: mongoose.Types.ObjectId,
//   name: { type: String, required: true },
//   description: { type: String, required: true },
//   rentCost: { type: Number, required: true },
//   qntInStock: { type: Number, require: true },
//   creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
//   reservedBy: [
//     {
//       type: mongoose.Types.ObjectId,
//       required: true,
//       ref: 'User',
//       pickUpTime: Date,
//     },
//   ],
// });

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
  storageItems: [
    {
      id: { type: mongoose.Types.ObjectId, require: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      rentCost: { type: Number, required: true },
      qntInStock: { type: Number, require: true },
      creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
      reservedBy: [
        {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: 'User',
          pickUpTime: Date,
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Storage', storageSchema);
