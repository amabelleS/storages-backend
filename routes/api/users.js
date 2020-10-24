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

// @route    POST api/users
// @desc     Register User
// @access   Public
// router.post(
//   '/',
//   [
//     check('name', 'Name Required').not().isEmpty(),
//     check('email', 'Please include a valid email').isEmail,
//     check(
//       'password',
//       'Please enter a password with 6 or more charecters'
//     ).isLength({ min: 6 }),
//   ],
//   (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({ errors: errors.array() });
//     }

//     const name = req.body.name;
//     const email = req.body.email;
//     const password = req.body.password;

//     res.send('User route');
//   }
// );

module.exports = router;
