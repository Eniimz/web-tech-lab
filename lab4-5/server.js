const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const { default: mongoose } = require("mongoose")
const Product = require("./models/product.model")

const app = express()
const PORT = 5000

mongoose.connect("mongodb://localhost:27017/lab4-5", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
    console.log("Mongoose is connected")
})

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(express.json())
app.use(expressLayouts)


app.get("/", (req, res) => {
    res.render("home")
})

app.get("/api/products", async (req, res) => {

    const products = await Product.find()
    res.send(products)
})

app.post("/api/products", async (req, res) => {
    const newProduct = new Product(req.body)
    await newProduct.save()
    res.send(newProduct)
})

app.put("/api/products/:id", async (req, res) => {
    console.log(req.params.id, req.body)
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.send(updatedProduct) 
})

app.delete("/api/products/:id", async (req, res) => {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)
    res.send(deletedProduct)
})

app.get("/contact-us", (req, res) => {
    res.render("contact")
})

app.listen(PORT, () => {
    console.log("Listening on PORT 5000")
})