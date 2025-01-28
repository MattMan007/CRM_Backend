const router = require("express").Router();
const Product = require("../models/productModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


router.post("/", async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // validation
    if (!name || !description || !price) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields",
      });
    }

    // make sure no account exists for this email
    const existingProduct = await Product.findOne({
      name: name,
    });

    if (existingProduct) {
      return res.status(400).json({
        errorMessage: "An account with this email already exists",
      });
    }

    // save the user in the database
    const newProduct = new Product({
      name: name,
      description: description,
      price: price,
    });

    
    const savedProduct = await newProduct.save();

    // create a JWT
    const token = jwt.sign(
      {
        id: savedProduct._id,
      },
      process.env.JWT_SECRET
    );

    // only make the cookie accesible via HTTP
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      }).send({message: newProduct});
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/currentproduct", async(req, res) => {
    try {
        const productId = req.query.id;
        const product = await Product.findById(productId);
  
      res.send(product);
    } catch (err) {
      return res.send(err);
    }
  });

router.delete("/delete/:id", async(req, res) => {
  try {
    const productId = req.params;
    await Product.findByIdAndDelete(productId.id);
    
    res.send("Ok");
    
  } catch (err) {
    return res.status(500).json(null);
  }
})

router.get("/products", async(req, res) => {
    try {
      const products = await Product.find();
      
      res.send(products);
      
    } catch (err) {
      return res.status(500).json(null);
    }
  })

router.post("/:id", async(req, res) => {
  try {
    const productId = req.params;
    const updateProduct = await Product.findByIdAndUpdate(productId.id, {name: req.body.name, description: req.body.description, price: req.body.price});
    res.send(updateProduct);
  } catch (err) {
    return res.status(500).json(null);
  }
})

module.exports = router;