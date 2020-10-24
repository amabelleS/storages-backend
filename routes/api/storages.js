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

// @route    PATCH api/storages/sid
// @desc     Update a storage
// @access   Private
router.patch(
  '/:sid',
  [[check('title').not().isEmpty(), check('description').isLength({ min: 5 })]],
  storagesControllers.updateStorage
);

// @route    PATCH api/storages/sid
// @desc     Delete a storage
// @access   Private
router.delete('/:sid', storagesControllers.deleteStorage);

module.exports = router;
