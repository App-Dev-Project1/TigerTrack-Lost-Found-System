const express = require('express');
const router = express.Router();
const { createFoundItem, getAllFoundItems, deleteFoundItem } = require('../controllers/foundItemController');

router.post('/', createFoundItem);
router.get('/', getAllFoundItems);
router.delete('/:id', deleteFoundItem);

module.exports = router;