const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/AmazonController');

router.get('/scrape', getProducts);

module.exports = router;