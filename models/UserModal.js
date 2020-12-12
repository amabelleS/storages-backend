const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
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
        type: mongoose.Types.ObjectId,
        ref: 'Storage',
        isAdmin: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
