const express = require('express');
const { check } = require('express-validator');

const usersControllers = require('../../controllers/users');

const router = express.Router();

// @route    GET api/users
// @desc     Get users
// @access   Public
// router.get('/', usersControllers.getUsers);

// @route    POST api/users
// @desc     signup
// @access   Public
router.post(
  '/signup',
  [
    check('name').not().isEmpty(),
    // check('IDnum').not().isEmpty(),
    check('phoneNum').not().isEmpty(),
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
