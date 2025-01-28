const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true},
    description: { type: String, required: true},
    client: { type: String, required: true },
    usersId: [ {type: String, required: false},],
    productsId: [ {type: String, required: false},],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("project", projectSchema);

module.exports = Project;