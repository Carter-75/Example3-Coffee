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
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "2",
    name: "Golden Hour Bloom",
    origin: "Costa Rica",
    notes: ["Honey", "Jasmine", "Citrus"],
    intensity: 4,
    price: 28.00,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "3",
    name: "Velvet Highlands",
    origin: "Guatemala",
    notes: ["Caramel", "Toasted Almond", "Vanilla"],
    intensity: 6,
    price: 22.00,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400"
  },
  {
    _id: "4",
    name: "Emerald Mist",
    origin: "Sumatra",
    notes: ["Earth", "Cedar", "Spice"],
    intensity: 8,
    price: 26.00,
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=400"
  }
];

// GET all roasts
router.get('/', (req, res) => {
  res.json(MOCK_ROASTS);
});

module.exports = router;

