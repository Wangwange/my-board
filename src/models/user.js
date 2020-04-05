const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  membership: {
    type: String,
    require: true,
  },
});

UserSchema.methods.setPassword = async function (password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  this.hashedPassword = hashedPassword;
};

UserSchema.methods.checkPassword = async function (password) {
  const correct = await bcrypt.compare(password, this.hashedPassword);
  return correct;
};

UserSchema.methods.generateToken = async function () {
  const token = jwt.sign(
    {
      _id: this.id,
      username: this.username,
      membership: this.membership,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  return token;
};

UserSchema.methods.serialize = function () {
  const userData = this.toJSON();
  delete userData.hashedPassword;
  return userData;
};

UserSchema.statics.findByUsername = function (username) {
  const user = this.findOne({ username });
  return user;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
