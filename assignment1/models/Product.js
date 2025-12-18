const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
  name: String,
  price: Number,
  color: String,
  category: String,
  department: String,
  description: String,
  image: String,
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
