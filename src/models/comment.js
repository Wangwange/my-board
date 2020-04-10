const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const CommentSchema = new mongoose.Schema({
  rootPostId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  rootCommentId: {
    type: mongoose.Types.ObjectId,
  },
  body: {
    type: String,
  },
  author: {
    username: {
      type: String,
    },
    _id: {
      type: mongoose.Types.ObjectId,
    },
  },
  hashedPassword: {
    type: String,
  },
  publishedDate: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.methods.setPassword = async function (password) {
  this.hashedPassword = await bcrypt.hash(password, 10);
};

CommentSchema.methods.serialize = function () {
  const commentData = this.toJSON();
  delete commentData.hashedPassword;
  return commentData;
};

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
