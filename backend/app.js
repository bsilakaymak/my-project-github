const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const placesRoute = require("./routes/places-route");
const usersRoute = require("./routes/users-route");
const HttpError = require("./model/http-error");
const connectDB = require("./config/db");
const app = express();
const port = process.env.PORT || 5000;
// connect the database
connectDB();

app.use(bodyParser.json());

app.use(express.static(path.join("public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoute);
app.use("/api/users", usersRoute);

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});
// Here I check if the user use a wrong path
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);

  throw error;
});

// Custom error handling /
app.use((error, req, res, next) => {
  // if (req.file) {
  //   fs.unlink(req.file.path, error => {
  //     console.log(error);
  //   });
  // }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unKnown error occurred!" });
});
// Connect the express server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
