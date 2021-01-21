const fs = require('fs');
const HttpError = require('../models/http-error');

const User = require('../models/UserModal');
const Storage = require('../models/storageModal');
const Item = require('../models/itemModal');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const getItemsByStorageId = async (req, res, next) => {
  const { storageId } = req.params;
  //   console.log(storageId);
  // let items;
  let storageWithItems;
  try {
    storageWithItems = await Storage.findById(storageId).populate('items');
  } catch (err) {
    const error = new HttpError(
      'Fetching items failed, please try again later.',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!storageWithItems || storageWithItems.items.length === 0) {
    return next(
      new HttpError('Could not find items for the provided storage id.', 404)
    );
  }

  res.json({
    places: storageWithItems.items.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createStorageItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { storageId } = req.params;

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

  // console.log(req.body.title);
  const {
    name,
    description,
    sirialNum,
    rentCost,
    depositAmount,
    qntInStock,
  } = req.body;

  const createdItem = new Item({
    name,
    description,
    sirialNum,
    rentCost,
    image: req.file.path,
    storage: storageId,
    depositAmount,
    qntInStock,
    creator: req.userData.userId,
  });

  try {
    await createdItem.save();
    storage.storageItems.push(createdItem);
    await storage.save();
  } catch (err) {
    const error = new HttpError('Creating item failed, please try again', 500);
    console.log(error, err);
    // console.log(typeOf location.log);

    return next(error);
  }
  console.log(storage);
  res.status(201).json({ item: createdItem, storage: storage });
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

exports.getItemsByStorageId = getItemsByStorageId;
exports.createStorageItem = createStorageItem;
exports.getUserItems = getUserItems;
