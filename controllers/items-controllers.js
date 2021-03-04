// const fs = require('fs');
const HttpError = require('../models/http-error');

const User = require('../models/UserModal');
const Item = require('../models/itemModal');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// user's items:
// @desc    GET storage items by USER
// @route   GET api/storages/:uid
// @access  Private
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

//
const itemIn = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const itemId = req.params.itemid;

  let item;

  try {
    item = await Item.findById(itemId).populate('storage');
  } catch (err) {
    return next(
      new HttpError('Somthing went wrong, could not fetch item', 500)
    );
  }

  if (item.storage.creator.toString() !== req.userData.userId) {
    return next(new HttpError('You are not allowed to check items in', 401));
  }

  item.out = false;

  try {
    await item.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update item.',
      500
    );
    return next(error);
  }

  res.status(200).json({
    item: item.toObject({ getters: true }),
    storage: item.storage.toObject({ getters: true }),
  });
};

exports.getUserItems = getUserItems;
exports.itemIn = itemIn;
