const mongoose = require('mongoose');

const Schema = mongoose.Schema;

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
  ActiveCommunityUsers: [
    { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  ],
  items: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Stroge' }],
});

module.exports = mongoose.model('Storage', storageSchema);
