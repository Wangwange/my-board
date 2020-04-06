const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
  author: {
    _id: {
      type: mongoose.Types.ObjectId,
    },
    username: {
      type: String,
      required: true,
    },
  },
  hashedPassword: {
    type: String,
  },
});

PostSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
