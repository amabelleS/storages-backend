const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    IDnum: {
      type: Number,
      required: true,
    },
    phoneNum: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // isAdmin: {
    //   type: Boolean,
    //   required: true,
    //   default: false,
    // },
    date: {
      type: Date,
      default: Date.now,
    },
    storages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Storage',
        isAdmin: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
    reservedItems: [
      { type: Schema.Types.ObjectId, required: true, ref: 'Item' },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
