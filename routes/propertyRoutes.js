const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

router.get('/', propertyController.listProperties);
router.get('/:id', propertyController.getPropertyDetails);

module.exports = router;
