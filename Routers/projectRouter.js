const router = require("express").Router();
const Project = require("../models/projectModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


router.post("/", async (req, res) => {
  try {
    const { name, description, client} = req.body;

    // validation
    if (!name || !description || !client) {
      return res.status(400).json({
        errorMessage: "Please enter all required fields",
      });
    }

    // make sure no account exists for this email
    const existingProject = await Project.findOne({
      name: name,
    });

    if (existingProject) {
      return res.status(400).json({
        errorMessage: "An account with this email already exists",
      });
    }

    // save the user in the database
    const newProject = new Project({
      name: name,
      description: description,
      client: client,
    });

    
    const savedProject = await newProject.save();

    // create a JWT
    const token = jwt.sign(
      {
        id: savedProject._id,
      },
      process.env.JWT_SECRET
    );

    // only make the cookie accesible via HTTP
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false
      }).send({message: newProject});
  } catch (err) {
    res.status(500).send();
  }
});

router.get("/currentproject", async(req, res) => {
    try {
        const projectId = req.query.id;
        const project = await Project.findById(projectId);
  
      res.send(project);
    } catch (err) {
      return res.send(err);
    }
  });

router.delete("/delete/:id", async(req, res) => {
  try {
    const projectId = req.params;
    await Project.findByIdAndDelete(projectId.id);
    
    res.send("Ok");
    
  } catch (err) {
    return res.status(500).json(null);
  }
})

router.get("/projects", async(req, res) => {
    try {
      const project = await Project.find();
      
      res.send(project);
      
    } catch (err) {
      return res.status(500).json(null);
    }
  })

router.post("/:id", async(req, res) => {
  try {
    const productId = req.params;
    const updateProject = await Project.findByIdAndUpdate(projectId.id, {name: req.body.name, description: req.body.description, client: req.body.client, usersId: req.body.usersId, projectsId: req.body.projectsId});
    res.send(updateProject);
  } catch (err) {
    return res.status(500).json(null);
  }
})

module.exports = router;