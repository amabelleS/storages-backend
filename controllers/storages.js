const fs = require('fs');
const HttpError = require('../models/http-error');
const uuid = require('uuid');
const getCoordsForAddress = require('../utils/locations');

const Storage = require('../models/storage');
const User = require('../models/User');

const { validationResult } = require('express-validator');

let DUMMY_STORAGES = [
  {
    id: 's1',
    title: "eliyahu's storage",
    description: 'community storage',
    location: {
      lat: 32.0603126,
      log: 34.7887586,
    },
    address: 'ברחבת האיצטדיון, מול וינגייט 18',
    creator: 'u1',
  },
];

const getStorageById = async (req, res, next) => {
  const storageId = req.params.sid;

  let storage;
  try {
    storage = await Storage.findById(storageId);
  } catch (err) {
    const error = new HttpError(
      'Somthing went wrong, could not find a storage',
      500
    );
    return next(error);
  }

  if (!storage) {
    return next(new HttpError('could not find this storage id', 404));
  }
  res.json({ storage: storage.toObject({ getters: true }) });
  // res.send('Storages route'));
};

const getAllStorages = async (req, res, next) => {
  let storages;
  try {
    storages = await Storage.find();
  } catch (err) {
    return next(
      new HttpError('fetching storages failed, please try again later', 500)
    );
  }

  if (!storages || storages.length === 0) {
    // throw error;
    return next(new HttpError('could not find storages', 404));
    // return res.status(404).json({ massege: 'could not find this storage id' });
  }
  res.json({
    storages: storages.map((storage) => storage.toObject({ getters: true })),
  });
};

const createStorage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdStorage = new Storage({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.path,
    admins: [req.userData.userId],
    creator: req.userData.userId,
  });

  let user;
  try {
    user = User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError('Creating place failed, please try again', 422));
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  // DUMMY_STORAGES.push(createdStorage);
  try {
    await createdStorage.save();
  } catch (err) {
    const error = new HttpError(
      'Creating storage failed, please try again',
      500
    );
    console.log(error, err);
    // console.log(typeOf location.log);

    return next(error);
  }

  res.status(201).json({ storage: createdStorage });
};

const updateStorage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { title, description } = req.body;
  const storageId = req.params.sid;

  let storage;

  try {
    storage = await Storage.findById(storageId);
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch storage', 500)
    );
  }

  if (storage.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this storage', 401));
  }

  storage.title = title;
  storage.description = description;

  try {
    await storage.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('Somthing went wrong, could not update storage', 500)
    );
  }

  res.status(200).json({ storage: storage.toObject({ getters: true }) });
};

const deleteStorage = async (req, res, next) => {
  const storageId = req.params.sid;

  let storage;
  try {
    storage = await Storage.findById(storageId);
  } catch (err) {
    return next(
      new HttpError(
        'Somthing went wrong, could not fetch storage for deleting',
        500
      )
    );
  }

  if (!storage) {
    return next(new HttpError('Could not find storage for this id', 404));
  }

  if (storage.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this storage.',
      401
    );
    return next(error);
  }

  const imagePath = storage.image;

  try {
    await storage.deleteOne();
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not update storage', 500)
    );
  }

  fs.unlink(imagePath, (err) => {
    console.log(err);
  });

  res.status(200).json({ message: 'Deleted storage' });
};

// module.exports = getStorageById;
exports.getStorageById = getStorageById;
exports.getAllStorages = getAllStorages;
exports.createStorage = createStorage;
exports.updateStorage = updateStorage;
exports.deleteStorage = deleteStorage;
