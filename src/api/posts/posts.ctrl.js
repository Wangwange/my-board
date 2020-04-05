const { Types } = require("mongoose");
const Joi = require("joi");
const Post = require("../../models/post");

// 포스트 ID가 필요한 요청에 한해 ID 검증
// 정상적인 포스트 ID면 해당 포스트를  ctx.state.post에 탑재
// id => void
exports.getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 비밀번호 또는 사용자 ID로 포스트 수정/삭제 권한 검사
// (user, password) => void
exports.checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  const { password } = ctx.request.body;

  if (user && user._id === post.author._id.toString()) {
    return next();
  }

  if (password === post.password) {
    return next();
  }

  ctx.status = 401;
  return;
};

// 회원의 포스트 게시 - POST /api/posts
// (title, body, tags) => post
exports.write = async (ctx, next) => {
  if (!ctx.state.user) return next();

  const { title, body, tags } = ctx.request.body;
  const Schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  const valid = Joi.validate(ctx.request.body, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  try {
    const { _id, username } = ctx.state.user;
    const post = new Post({
      title,
      body,
      tags,
      author: {
        _id,
        username,
      },
    });
    await post.save();
    ctx.body = post;
    return;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 비회원의 포스트 게시 - POST /api/posts
//(title, body, tags, username, password) => post
exports.writeWithoutAuth = async (ctx) => {
  const { title, body, tags, username, password } = ctx.request.body;
  const Schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const valid = Joi.validate(ctx.request.body, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  try {
    const post = new Post({
      title,
      body,
      tags,
      password,
      author: {
        username,
      },
    });
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 개별 포스트 조회 - GET /api/posts/:id
// id => post
exports.read = async (ctx) => {
  ctx.body = ctx.state.post;
};

// 포스트 목록 조회 - GET /api/posts
// () => posts
exports.list = async (ctx) => {
  try {
    const posts = await Post.find().exec();
    ctx.body = posts;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 포스트 수정 - PATCH /api/posts/:id
// id => post
exports.update = async (ctx, next) => {
  const { password, ...withoutPassword } = ctx.request.body;
  const Schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  const valid = Joi.validate(withoutPassword, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(
      ctx.state.post.id,
      withoutPassword,
      {
        new: true,
      }
    ).exec();

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

// 포스트 삭제 - DELETE /api/posts/:id
// id => void
exports.remove = async (ctx) => {
  try {
    await Post.findByIdAndRemove(ctx.state.post.id);
    ctx.status = 204;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};
