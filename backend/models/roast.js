const mongoose = require('mongoose');

const roastSchema = new mongoose.Schema({
  name: { type: String, required: true },
  origin: { type: String, required: true },
  notes: [{ type: String }],
  intensity: { type: Number, min: 1, max: 10 },
  price: { type: Number, required: true },
  image: { type: String },
  isFeatured: { type: Boolean, default: false },
  stock: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Roast', roastSchema);
