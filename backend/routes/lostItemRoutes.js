const express = require('express');
const router = express.Router();
const { createLostItem, getAllLostItems, deleteLostItem } = require('../controllers/lostItemController');

router.post('/', createLostItem);
router.get('/', getAllLostItems);
router.delete('/:id', deleteLostItem);

module.exports = router;