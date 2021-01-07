const fs = require('fs');
const HttpError = require('../models/http-error');
const uuid = require('uuid');
const getCoordsForAddress = require('../utils/locations');

const Storage = require('../models/storageModal');
const User = require('../models/UserModal');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// let DUMMY_STORAGES = [
//   {
//     id: 's1',
//     title: "eliyahu's storage",
//     description: 'community storage',
//     location: {
//       lat: 32.0603126,
//       log: 34.7887586,
//     },
//     address: 'ברחבת האיצטדיון, מול וינגייט 18',
//     creator: 'u1',
//   },
// ];

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
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(
      new HttpError('Creating storage failed, please try again', 422)
    );
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

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

// ITEMS:

// @desc    Create new storage item
// @route   POST /api/storages/:sid/items
// @access  Private
const createStorageItem = async (req, res, next) => {
  const errors = validationResult(req);
  // console.log(errors);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }
  const { name, description, rentCost, qntInStock } = req.body;
  const storageId = req.params.sid;

  let storage;

  try {
    storage = await Storage.findById(storageId);
    // console.log('storage fetched');
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch storage', 500)
    );
  }

  if (storage.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to add an item', 401));
  }

  const createdStorageItem = {
    name,
    description,
    rentCost: Number(rentCost),
    qntInStock: Number(qntInStock),
    reservedStack: 0,
    creator: req.userData.userId,
  };
  // console.log(createdStorageItem);

  storage.storageItems.push(createdStorageItem);

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError('... failed, please try again', 422));
  }

  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  try {
    await storage.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('Somthing went wrong, could not create storage item', 500)
    );
  }

  res.status(200).json({ storage: storage.toObject({ getters: true }) });
};

// @desc    Update storage item
// @route   PATCH api/storages/:sid/items/:itemid
// @access  Privat+/admin
const updateStorageItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { name, description, rentCost, qntInStock } = req.body;
  const storageId = req.params.sid;
  const itemId = req.params.itemid;

  let storage;

  try {
    storage = await Storage.findById(storageId);
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch storage', 500)
    );
  }

  if (storage.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError('You are not allowed to edit this storage item', 401)
    );
  }

  if (storage && storage.storageItems && storage.storageItems.length === 0) {
    return next(
      new HttpError('Could not find items for the provided storage id.', 404)
    );
  }

  let updatedItem;

  try {
    updatedItem = storage.storageItems.find(
      (item) => item._id.toString() === itemId.toString()
    );
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('Somthing went wrong, could not find storage item', 404)
    );
  }

  if (!updatedItem) {
    const error = new HttpError('Could not find item for provided id.', 404);
    return next(error);
  }

  if (updatedItem) {
    updatedItem.name = name;
    updatedItem.description = description;
    updatedItem.rentCost = rentCost;
    updatedItem.qntInStock = qntInStock;
  }

  try {
    await storage.save();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('Somthing went wrong, could not create storage item', 500)
    );
  }

  // try {
  //   await Storage.updateOne(
  //     { _id: storageId, 'storageItems._id': itemId },
  //     {
  //       $set: {
  //         'storageItems.$.name': name,
  //         'storageItems.$.description': description,
  //         'storageItems.$.qntInStock': qntInStock,
  //         'storageItems.$.rentCost': rentCost,
  //       },
  //     }
  //   );
  // res.status(200).json({ storage: storage.toObject({ getters: true }) });
  // storage.storageItems.set(itemId, {

  // });
  // } catch (err) {
  //   console.log(err);
  //   return next(
  //     new HttpError('Somthing went wrong, could not update storage item', 500)
  //   );
  // }

  res.status(200).json({
    storage: storage.toObject({ getters: true }),
  });
};

// @desc    DELETE storage item
// @route   DELETE api/storages/:sid/items/:itemid
// @access  Private+Admin
const deleteStorageItem = async (req, res, next) => {
  const storageId = req.params.sid;
  const itemId = req.params.itemid;

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

  const udpeteToDeleteItems = storage.storageItems.filter(
    (item) => item.id !== itemId
  );
  storage.storageItems = udpeteToDeleteItems;
  // const index = storage.storageItems.map((item, index) => {
  //   // item.id === itemId;
  //   console.log(item, index);
  // });
  // console.log(index);

  try {
    // storage.storageItems.splice(index, 1);
    // storage.storageItems.deleteOne({ _id: itemId });
    await storage.save();
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not delete storage item', 500)
    );
  }

  res.status(200).json({ message: `Deleted ${itemId}` });
};

// @desc    RESERVE/UNRESERVE storage item / Update stock
// @route   PATCH api/storages/:sid/items/:itemId/reserve
// @access  Private
const reserveStorageItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { reserve } = req.body;

  const storageId = req.params.sid;
  const itemId = req.params.itemid;

  let storage;

  try {
    storage = await Storage.findById(storageId);
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch storage', 500)
    );
  }

  if (!storage) {
    return next(new HttpError('Could not find storage for this id', 404));
  }

  if (storage && storage.storageItems && storage.storageItems.length === 0) {
    return next(
      new HttpError('Could not find items for the provided storage id.', 404)
    );
  }

  let reservedItem = storage.storageItems.find(
    (item) => item._id.toString() === itemId.toString()
  );

  if (!reservedItem) {
    const error = new HttpError('Could not find item for provided id.', 404);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Reserving storage item failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  if (
    reservedItem &&
    user &&
    reservedItem.reservedStack < reservedItem.qntInStock &&
    reserve
  ) {
    reservedItem.reservedBy.push(user);
    reservedItem.reservedStack += 1;
    user.reservedItems.push(reservedItem);
  } else if (reservedItem && reservedItem.reservedStack > 0 && !reserve) {
    if (!reservedItem.reservedBy.includes(req.userData.userId)) {
      const error = new HttpError('You have not reserved this item yet.', 404);
      return next(error);
    }

    const userIndex = reservedItem.reservedBy.findIndex(
      (item) => item.toString() === req.userData.userId.toString()
    );
    reservedItem.reservedBy.splice(userIndex, 1);
    reservedItem.reservedStack -= 1;

    const itemIndex = user.reservedItems.findIndex(
      (item) => item.toString() === itemId.toString()
    );
    user.reservedItems.splice(itemIndex, 1);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await storage.save({ session: sess });
    await user.save({ session: sess });
    await sess.commitTransaction();

    res.status(200).json({ storage: storage.toObject({ getters: true }) });
  } catch (err) {
    const error = new HttpError(
      'Reserving item failed, please try again.',
      500
    );
    return next(error);
  }
};

// module.exports = getStorageById;
exports.getStorageById = getStorageById;
exports.getAllStorages = getAllStorages;
exports.createStorage = createStorage;
exports.updateStorage = updateStorage;
exports.deleteStorage = deleteStorage;

exports.createStorageItem = createStorageItem;
exports.updateStorageItem = updateStorageItem;
exports.deleteStorageItem = deleteStorageItem;
exports.reserveStorageItem = reserveStorageItem;
