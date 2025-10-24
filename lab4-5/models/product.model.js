const mongoose = require("mongoose")

const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    }
})

const Product = mongoose.model("Product", productsSchema)

module.exports = Product