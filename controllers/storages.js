const fs = require('fs');
const HttpError = require('../models/http-error');
const uuid = require('uuid');
const getCoordsForAddress = require('../utils/locations');

const Storage = require('../models/storageModal');
const User = require('../models/UserModal');
const Item = require('../models/itemModal');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const { cloudinary } = require('../cloudinary');

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
    storage = await Storage.findById(storageId).populate('storageItems');
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
  // console.log(storage);
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

  // console.log(req.body.title);
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  console.log(req.file);
  const createdStorage = new Storage({
    title,
    description,
    address,
    location: coordinates,
    // image: req.file.path,
    image: { url: req.file.path, filename: req.file.filename },
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
  // console.log(user);!!!
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

//delete storage
const deleteStorage = async (req, res, next) => {
  const storageId = req.params.sid;

  let storage;
  try {
    storage = await Storage.findById(storageId).populate('storageItems');
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

  // const imagePath = storage.image;
  if (storage.storageItems && storage.storageItems.length > 0) {
    try {
      storage.storageItems.forEach(async (item) => {
        await cloudinary.uploader.destroy(item.image.filename);
      });
    } catch (err) {
      return next(
        new HttpError(
          'Somthing went wrong, could not delete items images on cloud',
          500
        )
      );
    }
  }

  try {
    await cloudinary.uploader.destroy(storage.image.filename);
    await storage.deleteOne();
    await Item.deleteMany({ _id: { $in: storage.storageItems } });
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not delete storage', 500)
    );
  }

  // fs.unlink(imagePath, (err) => {
  //   console.log(err);
  // });

  res.status(200).json({ message: 'Deleted storage' });
};

// ITEMS:

// @desc    Create new storage item
// @route   POST /api/storages/:sid/items
// @access  Private

const createStorageItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(
      new HttpError('Creating storage item failed, please try again', 422)
    );
  }
  // console.log(user);!!!
  if (!user) {
    return next(new HttpError('Could not find user for provided id', 404));
  }

  const storageId = req.params.sid;
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

  if (storage.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to add an item', 401));
  }
  // update items/stock count:
  // try {
  //   storage.TotalItemsInStockCount.push({
  //     date: Date.now,
  //     amount: storage.storageItems.length + 1,
  //   });
  // } catch (err) {
  //   console.log(err);
  // }

  const newItemsInStockLog = {
    date: new Date(),
    amount: storage.storageItems.length + 1,
  };

  const { name, description, innerNum, rentCost, depositAmount } = req.body;
  // console.log(req.file);

  const createdItem = new Item({
    name,
    description,
    innerNum,
    rentCost,
    // inStock,
    depositAmount,
    image: { url: req.file.path, filename: req.file.filename },
    storage: storage,
    creator: req.userData.userId,
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdItem.save({ session: sess });
    storage.storageItems.push(createdItem);
    storage.totalItemsInStockCountLog.push({
      date: new Date(),
      amount: storage.storageItems.length,
    });
    await storage.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating storage item failed, please try again.',
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ storage: storage.toObject({ getters: true }), item: createdItem });
};

// TODO ---- MOVE TO ITEMS ------------------
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

  const { name, description, rentCost } = req.body;
  const itemId = req.params.itemid;

  let item;

  try {
    item = await Item.findById(itemId);
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch item', 500)
    );
  }

  if (item.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError('You are not allowed to edit this storage item', 401)
    );
  }

  item.name = name;
  item.description = description;
  item.rentCost = rentCost;

  try {
    await item.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update item.',
      500
    );
    return next(error);
  }

  res.status(200).json({ item: item.toObject({ getters: true }) });
};

// @desc    DELETE storage item
// @route   DELETE api/storages/:sid/items/:itemid
// @access  Private+Admin
const deleteStorageItem = async (req, res, next) => {
  // const storageId = req.params.sid;
  const itemId = req.params.itemid;

  let item;
  try {
    item = await Item.findById(itemId).populate('storage');
  } catch (err) {
    return next(
      new HttpError(
        'Somthing went wrong, could not fetch item for deleting',
        500
      )
    );
  }

  if (!item) {
    return next(new HttpError('Could not find item for this id', 404));
  }

  if (item.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this item.',
      401
    );
    return next(error);
  }

  try {
    await cloudinary.uploader.destroy(item.image.filename);
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not delete image', 500)
    );
  }
  // const imagePath = item.image;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await item.remove({ session: sess });
    item.storage.storageItems.pull(item);
    item.storage.totalItemsInStockCountLog.push({
      date: new Date(),
      amount: item.storage.storageItems.length,
    });
    await item.storage.save({ session: sess });
    // console.log(item);
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete item.',
      500
    );
    return next(error);
  }

  // fs.unlink(imagePath, (err) => {
  //   console.log(err);
  // });

  res.status(200).json({
    message: `Deleted item ${itemId}.`,
    storage: item.storage.toObject({ getters: true }),
  });
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

  // const storageId = req.params.sid;
  const itemId = req.params.itemid;

  let item;

  try {
    item = await Item.findById(itemId)
      .populate('storage')
      .populate('reservedBy');
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch item', 500)
    );
  }

  if (!item) {
    return next(new HttpError('Could not find item for this id', 404));
  }

  if (item.out === true) {
    return next(new HttpError('Please check item in first', 403));
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
  console.log(user);
  if (item && user && reserve && item.inStock) {
    item.reservedBy = req.userData.userId;
    item.reservedByDetails = {
      // _id: req.userData.userId,
      name: user.name,
      email: user.email,
      phoneNum: user.phoneNum,
    };

    item.inStock = false;
    user.reservedItems.push(item);
  } else if (item && user && !reserve && !item.inStock) {
    // if (item.reservedBy !== req.userData.userId) {
    //   const error = new HttpError('You have not reserved this item yet.', 404);
    //   return next(error);
    // }
    item.reservedBy = null;
    item.reservedByDetails = null;
    item.inStock = true;
    user.reservedItems.pull(item);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await item.save({ session: sess });
    await user.save({ session: sess });
    await sess.commitTransaction();
    // console.log(item.storage);
    res.status(200).json({
      item: item.toObject({ getters: true }),
      storage: item.storage.toObject({ getters: true }),
    });
  } catch (err) {
    const error = new HttpError(
      'Reserving item failed, please try again.',
      500
    );
    return next(error);
  }
};

// @desc    PATCH update storage logs
// @route   PATCH api/storages/:storageId/items/:itemId/out
// @access  Private+admin
const itemOut = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { income } = req.body;

  const storageId = req.params.sid;
  const itemId = req.params.itemid;

  let storage;

  try {
    storage = await Storage.findById(storageId);
    // console.log('storage fetched');
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch storage', 500)
    );
  }

  if (!storage) {
    return next(new HttpError('Could not find storage for this id', 404));
  }

  if (storage.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to add an item', 401));
  }

  let item;

  try {
    item = await Item.findById(itemId);
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch item', 500)
    );
  }

  if (!item) {
    return next(new HttpError('Could not find item for this id', 404));
  }

  if (item.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to out this item.', 401);
    return next(error);
  }

  if (item.inStock === true || !item.reservedBy) {
    return next(new HttpError('Please reserve item first', 403));
  }

  // update logs
  storage.incomeLog.push({ date: new Date(), amount: income });
  storage.activeCommunityUsers.push(item.reservedBy);
  item.out = true;
  // item.inStock = false;
  // const totalItemOutNow =
  //   storage.storageItems.filter((item) => item.out).length + 1;
  console.log(storage.incomeLog);
  // storage.totalItemsCurrentlyInUseLog.push({
  //   date: Date.now(),
  //   amount: totalItemOutNow,
  // });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    // console.log(item);
    await item.save({ session: sess });
    await storage.save({ session: sess });
    await sess.commitTransaction();

    res.status(200).json({
      item: item.toObject({ getters: true }),
      storage: storage.toObject({ getters: true }),
    });
  } catch (err) {
    const error = new HttpError(
      'Reserving item failed, please try again.',
      500
    );
    return next(error);
  }
};

// add charts nodes:

const addItemsNode = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { x, y1, y2 } = req.body;
  const storageId = req.params.sid;

  let storage;

  try {
    storage = await Storage.findById(storageId).populate('itemsDataPoints');
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch storage', 500)
    );
  }

  if (storage.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to edit this storage', 401));
  }
  // let d = x.toLocaleDateString();
  // console.log(d);
  // let h = x.toISOString().slice(0, 10);
  // console.log(h);
  storage.itemsDataPoints.push({ x, y1, y2 });

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

// user's items:

const getUserItems = async (req, res, next) => {
  const userId = req.params.uid;

  // let items;
  let userWithItems;
  try {
    userWithItems = await User.findById(userId).populate('reservedItems');
  } catch (err) {
    const error = new HttpError(
      'Fetching items failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!item || items.length === 0) {
  if (!userWithItems || userWithItems.reservedItems.length === 0) {
    return next(
      new HttpError('Could not find items for the provided user id.', 404)
    );
  }

  res.json({
    items: userWithItems.reservedItems.map((item) =>
      item.toObject({ getters: true })
    ),
  });
};

// get storage users who reseved items
const getStorageUsers = async (req, res, next) => {
  const storageId = req.params.sid;

  let storage;
  try {
    storage = await Storage.findById(storageId).populate('storageItems');
    // .populate('reservedBy', '-password');
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
  // console.log(storage);
  res.json({ storage: storage.toObject({ getters: true }) });
  // res.send('Storages route'));
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
exports.itemOut = itemOut;
exports.addItemsNode = addItemsNode;

exports.getStorageUsers = getStorageUsers;

// exports.getUserItems = getUserItems;
