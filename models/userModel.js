const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true},
    lastname: { type: String, required: true},
    passwordHash: { type: String, required: true },
    department: {type: String, required: false},
    phone: {type: String, required: false},
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

module.exports = User;