const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const usersControllers = require('../../controllers/users');
const { route } = require('./auth');

// @route    GET api/users
// @desc     Get users
// @access   Public
router.get('/', usersControllers.getUsers);

// @route    POST api/users
// @desc     signup
// @access   Public
router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersControllers.signup
);

// @route    POST api/
// @desc     login
// @access   Public
router.post('/login', usersControllers.login);

module.exports = router;
