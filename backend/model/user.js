const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const HttpError = require("../model/http-error");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6
  },
  image: {
    type: String
  },
  places: [
    {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Place"
    }
  ],
  bucketList: [
    {
      id:{ type: mongoose.Types.ObjectId, required: true, ref: "Place" },
      _id:false,
      createdBy: {type:String},
      isVisited:  {type:Boolean, required:true}

    }
  ]
});
// I created my own method to handle the login process
userSchema.statics.findBuCredantials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError("Invalid credentials, could not log you in.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new HttpError("Invalid credentials, could not log you in.", 401);
  }
  return user;
};

// Hash the plain text password before saveing
userSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});
userSchema.plugin(uniqueValidator);
const User = mongoose.model("User", userSchema);

module.exports = mongoose.model("User", userSchema);
