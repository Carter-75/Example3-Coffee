const express = require('express');
const router = express.Router();

const MOCK_ROASTS = [
  {
    _id: "1",
    name: "Midnight Obsidian",
    origin: "Ethiopia & Colombia",
    notes: ["Dark Chocolate", "Black Cherry", "Smoke"],
    intensity: 9,
    price: 24.00,
    isFeatured: true,
    image: "/midnight_obsidian.png"
  },
  {
    _id: "2",
    name: "Golden Hour Bloom",
    origin: "Costa Rica",
    notes: ["Honey", "Jasmine", "Citrus"],
    intensity: 4,
    price: 28.00,
    image: "/golden_hour.png"
  },
  {
    _id: "3",
    name: "Velvet Highlands",
    origin: "Guatemala",
    notes: ["Caramel", "Toasted Almond", "Vanilla"],
    intensity: 6,
    price: 22.00,
    image: "/velvet_highlands.png"
  },
  {
    _id: "4",
    name: "Emerald Mist",
    origin: "Sumatra",
    notes: ["Earth", "Cedar", "Spice"],
    intensity: 8,
    price: 26.00,
    image: "/emerald_mist.png"
  }
];

// GET all roasts
router.get('/', (req, res) => {
  res.json(MOCK_ROASTS);
});

module.exports = router;

