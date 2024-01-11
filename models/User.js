const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const Schema = mongoose.Schema;

const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// const userSchema = Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true, select: false },

//     avatarUrl: { type: String, default: "" },
//   },
//   { timestamps: true }
// );

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },

    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.plugin(findOrCreate);

// overwrite methods
userSchema.methods.toJSON = function () {
  // remove fields from info returned
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  return user;
};

// generate JWT
userSchema.methods.generateToken = async function () {
  // const accessToken = await jwt.sign({ _id: this._id, name: this.name, email: this.email }, JWT_SECRET_KEY, {
  //   expiresIn: "30d",
  // });
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
  return accessToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
