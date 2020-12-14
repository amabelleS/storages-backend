const express = require('express');
const router = express.Router();

const { check } = require('express-validator');

const storagesControllers = require('../../controllers/storages');
const fileUpload = require('../../middlware/file-upload');
const checkAuth = require('../../middlware/check-auth');
// const getStorageById = require('../../controllers/storages');

// @route    GET api/storages
// @desc     Test all storages
// @access   Public
// router.get('/', (req, res) => res.json({ massege: 'storages works' }));
// res.send('Storages route'));

// @route    GET api/storages
// @desc     get all storage
// @access   Public
router.get('/', storagesControllers.getAllStorages);

// @route    GET api/storages/sid
// @desc     get storage
// @access   Public
router.get('/:sid', storagesControllers.getStorageById);

router.use(checkAuth);

// @route    POST api/storages
// @desc     Create a storage
// @access   Public+auth
router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  storagesControllers.createStorage
);

// @route    PATCH api/storages/:sid
// @desc     Update a storage
// @access   Private
router.patch(
  '/:sid',
  [[check('title').not().isEmpty(), check('description').isLength({ min: 5 })]],
  storagesControllers.updateStorage
);

// @route    PATCH api/storages/:sid
// @desc     Delete a storage
// @access   Private
router.delete('/:sid', storagesControllers.deleteStorage);

// ITEMS ----------------------------------------------------

// @desc    Create new storage item
// @route   POST api/storages/:sid/items
// @access  Private+/admin
router.post(
  '/:sid/items',
  [
    check('name').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('rentCost').not().isEmpty(),
    check('qntInStock').not().isEmpty(),
  ],
  storagesControllers.createStorageItem
);

// @desc    Update storage item
// @route   PATCH api/storages/:sid/items
// @access  Privat+/admin
router.patch(
  '/:sid/items/:itemid',
  [
    [
      check('name').not().isEmpty(),
      check('description').isLength({ min: 5 }),
      check('rentCost').not().isEmpty(),
      check('qntInStock').not().isEmpty(),
    ],
  ],
  storagesControllers.updateStorageItem
);

// @desc    Delete storage item
// @route   DELETE api/storages/:sid/items/:itemid
// @access  Private+/admin
router.delete('/:sid/items/:itemid', storagesControllers.deleteStorageItem);

// @desc    RESERVE/UNRESERVE storage item / Update stock
// @route   PATCH api/storages/:sid/items/reserve
// @access  Private
router.patch(
  '/:sid/items/:itemid/reserve',
  [[check('reserve').not().isEmpty()]],
  storagesControllers.reserveStorageItem
);

module.exports = router;
