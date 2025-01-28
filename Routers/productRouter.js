const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");


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
    await Product.findByIdAndDelete(userId.id);
    
    res.send("Ok");
    
  } catch (err) {
    return res.status(500).json(null);
  }
})

router.get("/users", async(req, res) => {
    try {
      const users = await User.find();
      
      res.send(users);
      
    } catch (err) {
      return res.status(500).json(null);
    }
  })

router.post("/:id", async(req, res) => {
  try {
    const userId = req.params;
    const updateUser = await User.findByIdAndUpdate(userId.id, {name: req.body.name, lastname: req.body.lastname, email: req.body.email, phone: req.body.phone, department: req.body.department});
    res.send(updateUser);
  } catch (err) {
    return res.status(500).json(null);
  }
})

router.post("/reset/:id", async(req, res) => {
    try{
        const userId = req.params;
        const securePassword = generateSecurePassword(16);
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(securePassword, salt);
        const resetPass = await User.findByIdAndUpdate(userId.id, {passwordHash: passwordHash});
        res.send(securePassword);
    } catch (err) {
        return res.status(500).json(null);
    }
})

module.exports = router;