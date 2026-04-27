const express = require('express');
const router = express.Router();
const Roast = require('../models/roast');

// GET all roasts
router.get('/', async (req, res) => {
  try {
    const roasts = await Roast.find().sort({ isFeatured: -1, name: 1 });
    res.json(roasts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
