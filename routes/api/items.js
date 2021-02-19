const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const itemsControllers = require('../../controllers/items-controllers');
const fileUpload = require('../../middlware/file-upload');
const checkAuth = require('../../middlware/check-auth');

// @desc    GET storage items by USER
// @route   GET api/storages/:uid
// @access  Private
router.get('/:uid', itemsControllers.getUserItems);

// @route    PATCH api/itemId/items
// @desc     log item in
// @access   Private + admin
router.patch('/:itemid/in', itemsControllers.itemIn);

// @route    POST api/storages/sid/items
// @desc     Create an item
// @access   Public+auth+admin
// router.post(
//   '/',
//   fileUpload.single('image'),
//   [
//     check('name').not().isEmpty(),
//     check('description').isLength({ min: 5 }),
//     // check('sirialNum').not().isEmpty(),
//     check('rentCost').not().isEmpty(),
//     // check('depositAmount').not().isEmpty(),
//     // check('qntInStock').not().isEmpty(),
//   ],
//   itemsControllers.createStorageItem
// );

module.exports = router;
