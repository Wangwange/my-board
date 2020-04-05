const { Types } = require("mongoose");
const Post = require("../../models/post");

// 게시물 ID가 필요한 요청에 한해 ID 검증
exports.checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }
  return next();
};

// 포스트 게시 - (title, body, tags) => post
// POST /api/posts
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
      ctx.status = 400; //필수 항목이 빠진 요청이면 Bad Request
      return;
    }
    ctx.status = 500;
    return;
  }
};

// 개별 포스트 조회 - id => post
// GET /api/posts/:id
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

// 포스트 목록 조회 - () => posts
// GET /api/posts
exports.list = async (ctx) => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 포스트 수정 - id => post
// PATCH /api/posts/:id
exports.update = async (ctx) => {
  const { id } = ctx.params;
  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    }).exec();

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

// 포스트 삭제 - id => void
// DELETE /api/posts/:id
exports.delete = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id);
    ctx.status = 204;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};
