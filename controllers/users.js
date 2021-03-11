const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const uuid = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

const User = require('../models/UserModal');

// DUMMY_USERS = [
//   {
//     id: 'u1',
//     name: 'Amabelle Selene',
//     email: 'test@test.com',
//     password: 'testers',
//   },
// ];

// signup
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Ivalid inputs passed, please check your data', 422)
    );
  }

  const { name, phoneNum, facebookName, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError('Signing up failed, please try again later', 500)
    );
  }

  if (existingUser) {
    return next(
      new HttpError('User axists already, please login instaed', 422)
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    facebookName,
    phoneNum,
    email,
    password: hashedPassword,
    storages: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again', 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again', 500);
    return next(error);
  }

  // res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
    facebookName: createdUser.facebookName,
    token: token,
  });
};

// login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError('logging in failed, please try again later', 500)
    );
  }

  if (!existingUser) {
    return next(new HttpError('Invalid credentials, could not log in.', 403));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again',
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    return next(new HttpError('Invalid credentials, could not log in.', 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('loggin in failed, please try again', 500);
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    facebookName: existingUser.facebookName,
    token: token,
  });
};

exports.signup = signup;
exports.login = login;
