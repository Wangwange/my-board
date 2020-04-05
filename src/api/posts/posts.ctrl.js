const { Types } = require("mongoose");
const Post = require("../../models/post");

exports.checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  return next();
};

exports.write = async (ctx) => {
  const { title, body, tags } = ctx.request.body;
  try {
    const post = new Post({
      title,
      body,
      tags,
    });
    await post.save();
    ctx.body = post;
  } catch (e) {
    console.log(e);
    if (e.name === "ValidationError") {
      ctx.status = 400;
      return;
    }
    ctx.status = 500;
    return;
  }
};

exports.read = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

exports.list = async (ctx) => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};
