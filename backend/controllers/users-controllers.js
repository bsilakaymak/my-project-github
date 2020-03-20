const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const HttpError = require("../model/http-error");
const User = require("../model/user");
const config = require("config");
const jwtKey = config.get("JWT_KEY");
var cloudinary = require("../uploads/cloudinary");

const getUsers = async (req, res, next) => {
  let users;

  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(
      new HttpError("Fetching users failed, please try again later.", 500)
    );
  }
  res
    .status(200)
    .json({ users: users.map(user => user.toObject({ getters: true })) });
};


const signup = async (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty())
    return next(
      new Error("Invalid input passed, please check your data.", 422)
    );
  const { name, email, password } = req.body;
  let createdUser;
  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser)
      return next(
        new HttpError("User exists already, please login instead.", 422)
      );
    // upload the image first to the cloudinary than I saved the image url on mongodb
    const result = await cloudinary.uploader.upload(req.file.path);

    createdUser = new User({
      name,
      email,
      image: result.url,
      password,
      places: [],
      bucketList: []
    });

    await createdUser.save();
  } catch (error) {
    return next(
      new HttpError("Signin up  failed, please try again later. could not save", 500)
    );
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email, token },
      jwtKey,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try agein later could not create token", 500)
    );
  }
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findBuCredantials(email, password);
  } catch (error) {
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email, token },
      jwtKey,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Loggin in failed, please try agein later", 500));
  }
  res
    .status(201)
    .json({ userId: existingUser.id, email: existingUser.email, token });
};

module.exports = { getUsers, signup, login };
