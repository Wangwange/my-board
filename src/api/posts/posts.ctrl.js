const { Types } = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const Post = require("../../models/post");

// 포스트 ID가 필요한 요청에 한해 ID 검증
// 정상적인 포스트 ID면 해당 포스트를 ctx.state.post에 탑재
exports.getPostById = async (ctx, next) => {
  const { id: postId } = ctx.params;
  if (!Types.ObjectId.isValid(postId)) {
    ctx.status = 400;
    return;
  }

  try {
    const post = await Post.findById(postId).exec();
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

// 사용자 ID 또는 비밀번호로 포스트 수정/삭제 권한 검사
exports.checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  const { password: postPassword } = ctx.request.body;

  const userId = user && user._id;
  const authorId = post.author._id && post.author._id.toString();

  // Admin 권한이면 무제한
  if (user && user.membership === "admin") {
    return next();
  }

  // 회원이 작성한 포스트라면 사용자 ID와 작성자 ID 비교
  if (post.author._id && user && userId === authorId) {
    return next();
  }

  // 비회원이 작성한 포스트라면 요청에 담긴 비밀번호와 포스트 비밀번호 비교
  if (
    post.hashedPassword &&
    postPassword &&
    bcrypt.compareSync(postPassword, post.hashedPassword)
  ) {
    return next();
  }

  ctx.status = 401;
  return;
};

// 포스트 게시 - POST /api/posts
exports.write = async (ctx) => {
  const { user } = ctx.state;
  const withoutAuth = !user;
  const { title, body, tags, username, password } = ctx.request.body;

  // 비회원 포스트라면 작성자명과 포스트 비밀번호가 있는지 추가로 검증
  const Schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
    ...(withoutAuth
      ? { username: Joi.string().required(), password: Joi.string().required() }
      : {}),
  });

  const valid = Joi.validate(ctx.request.body, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  try {
    // 회원이라면 작성자 ID를, 비회원이라면 포스트 비밀번호를 저장
    const post = new Post({
      title,
      body,
      tags,
      author: {
        ...(withoutAuth
          ? { username }
          : { _id: user._id, username: user.username }),
      },
    });
    if (withoutAuth) {
      await post.setPassword(password);
    }
    await post.save();
    ctx.body = post;
    return;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 개별 포스트 조회 - GET /api/posts/:id
exports.read = async (ctx) => {
  ctx.body = ctx.state.post;
};

// 포스트 목록 조회 - GET /api/posts
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
exports.update = async (ctx) => {
  // 추가적인 검증이 필요 없는 포스트 비밀번호를 분리
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
exports.remove = async (ctx) => {
  try {
    await Post.findByIdAndRemove(ctx.state.post.id);
    ctx.status = 204;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};
