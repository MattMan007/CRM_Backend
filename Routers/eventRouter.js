const router = require("express").Router();
const Event = require("../models/eventModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../models/productModel");


router.post("/", async (req, res) => {
  try {
    const { name, date, location} = req.body;

    // validation
    if (!name || !date || !location) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields",
      });
    }

    // make sure no account exists for this email
    const existingEvent = await Event.findOne({
      name: name,
    });

    if (existingEvent) {
      return res.status(400).json({
        errorMessage: "An account with this email already exists",
      });
    }

    // save the user in the database
    const newEvent = new Event({
      name: name,
      date: date,
      location: location,
    });

    
    const savedEvent = await newEvent.save();

    // create a JWT
    const token = jwt.sign(
      {
        id: savedEvent._id,
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

router.get("/currentevent", async(req, res) => {
    try {
        const eventId = req.query.id;
        const event = await Event.findById(eventId);
  
      res.send(event);
    } catch (err) {
      return res.send(err);
    }
  });

router.delete("/delete/:id", async(req, res) => {
  try {
    const eventId = req.params;
    await Event.findByIdAndDelete(eventId.id);
    
    res.send("Ok");
    
  } catch (err) {
    return res.status(500).json(null);
  }
})

router.get("/events", async(req, res) => {
    try {
      const event = await Event.find();
      
      res.send(event);
      
    } catch (err) {
      return res.status(500).json(null);
    }
  })

router.post("/:id", async(req, res) => {
  try {
    const eventId = req.params;
    const updateEvent = await Event.findByIdAndUpdate(eventId.id, {name: req.body.name, date: req.body.date, location: req.body.location, participants: req.body.participants});
    res.send(updateEvent);
  } catch (err) {
    return res.status(500).json(null);
  }
})

module.exports = router;