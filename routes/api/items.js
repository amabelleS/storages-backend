const express = require('express');
const router = express.Router();

// const { check } = require('express-validator');
// const fileUpload = require('../../middlware/file-upload');
const checkAuth = require('../../middlware/check-auth');

const itemsControllers = require('../../controllers/items-controllers');

// @desc    GET storage items by USER
// @route   GET api/storages/:uid
// @access  Private
router.get('/:uid', itemsControllers.getUserItems);

router.use(checkAuth);

// @route    PATCH api/itemId/items
// @desc     log item in
// @access   Private + admin
router.patch('/:itemid/in', itemsControllers.itemIn);

module.exports = router;
