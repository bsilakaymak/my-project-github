const jwt = require("jsonwebtoken");
const HttpError = require("../model/http-error");
const config = require("config");
const JWT_KEY = config.get("JWT_KEY");
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("Authentication faild!");
    }
    const decodedToken = jwt.verify(token, JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }
};
