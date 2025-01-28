const router = require("express").Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function generateSecurePassword(length = 12) {
    // Characters for the password
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialCharacters = "!@#$%^&*()_+[]{}|;:,.<>?";
    
    // Ensure the password includes at least one character from each group
    const allCharacters = upperCase + lowerCase + numbers + specialCharacters;
  
    // Pick at least one character from each set for security
    let password = [
      upperCase[Math.floor(Math.random() * upperCase.length)],
      lowerCase[Math.floor(Math.random() * lowerCase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      specialCharacters[Math.floor(Math.random() * specialCharacters.length)]
    ];
  
    // Fill the rest of the password length
    for (let i = password.length; i < length; i++) {
      const randomCharacter = allCharacters[Math.floor(Math.random() * allCharacters.length)];
      password.push(randomCharacter);
    }
  
    // Shuffle the password to avoid predictable patterns
    password = password.sort(() => Math.random() - 0.5);
  
    return password.join("");
  }
  

router.post("/", async (req, res) => {
  try {
    const { email, name, lastname, password, passwordVerify } = req.body;

    // validation
    if (!email || !password || !passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields",
      });
    }

    if (password.length < 10) {
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 6 characters",
      });
    }

    if (password != passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password twice for verification",
      });
    }

    // make sure no account exists for this email
    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser) {
      return res.status(400).json({
        errorMessage: "An account with this email already exists",
      });
    }

    // hash the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(passwordHash);

    // save the user in the database
    const newUser = new User({
      email: email,
      name: name,
      lastname: lastname,
      passwordHash: passwordHash,
    });

    
    const savedUser = await newUser.save();

    // create a JWT
    const token = jwt.sign(
      {
        id: savedUser._id,
      },
      process.env.JWT_SECRET
    );

    // only make the cookie accesible via HTTP
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      }).send({message: newUser});
  } catch (err) {
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields",
      });
    }

    // get user account
    const existingUser = await User.findOne({
      email: email,
    });

    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Wrong email or password",
      });
    }

    const correctPassword = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!correctPassword) {
      return res.status(401).json({
        errorMessage: "Wrong email or password",
      });
    }

    // create a JWT
    const token = jwt.sign(
      {
        id: existingUser._id,
      },
      process.env.JWT_SECRET
    );
    //console.log(token);

    // only make the cookie accesible via HTTP
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      })
      .send();
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/loggedIn", (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.json(null);
    }

    const validatedUser = jwt.verify(token, process.env.JWT_SECRET);

    res.json(validatedUser.id);
  } catch (err) {
    return res.json(null);
  }
});

router.get("/logOut", (req, res) => {
  try {
    res
      .cookie("token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        expires: new Date(0),
      })
      .send();
  } catch (err) {
    return res.json(null);
  }
});

router.get("/currentuser", async(req, res) => {
    try {
        const userId = req.query.id;
        const user = await User.findById(userId);
  
      res.send(user);
    } catch (err) {
      return res.send(err);
    }
  });

router.delete("/delete/:id", async(req, res) => {
  try {
    const userId = req.params;
    await User.findByIdAndDelete(userId.id);
    
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
        const securePassword = generateSecurePassword(12);
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(securePassword, salt);
        const resetPass = await User.findByIdAndUpdate(userId.id, {passwordHash: passwordHash});
        res.send(securePassword);
    } catch (err) {
        return res.status(500).json(null);
    }
})

module.exports = router;