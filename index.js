const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

dotenv.config();

// setup express server

const app = express();

// for any incoming path, first run the request through this function
// checks if the content type header is of type json
// pasrses the content to a js object, setting it up in the req.body object
// continues to the next endpoint
app.use(express.json());
// solving the CORS error
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// set up routers
app.use("/users", require("./routers/userRouter"));
app.use("/users", require("./routers/eventRouter"));
app.use("/users", require("./routers/producRouter"));
app.use("/users", require("./routers/projectRouter"));


// connect to mongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
