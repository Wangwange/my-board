const mongoose = require("mongoose");

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
  password: {
    type: String,
  },
});

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
