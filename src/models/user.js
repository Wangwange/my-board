const mongoose = require("module");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  authority: {
    type: String,
    require: true,
  },
});

UserSchema.methods.setPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  this.hashedPassword = hashedPassword;
};

UserSchema.methods.checkPassword = async (password) => {
  const correct = await bcrypt.compare(password, this.hashedPassword);
  return correct;
};

UserSchema.statics.findByUsername = async (username) => {
  const user = this.findOne({ username });
  return user;
};

const User = mongoose.Module("User", UserSchema);

module.exports = User;
