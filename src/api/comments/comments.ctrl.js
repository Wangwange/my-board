const mongoose = require("mongoose");
const Joi = require("joi");
const sanitizeHtml = require("sanitize-html");
const Comment = require("../../models/comment");
const Post = require("../../models/post");
const Validation = require("../../lib/validation");

exports.checkOwnComment = async (ctx, next) => {
  const { user } = ctx.state;
  const comment = await Comment.findById(ctx.params.id);
  const { password: commentPassword } = ctx.request.body;

  // ObjectID는 문자열로 변환한 뒤 비교
  const userId = user && user._id;
  const authorId = comment.author._id && comment.author._id.toString();

  // Admin 권한이면 무제한
  if (user && user.membership === "admin") {
    return next();
  }

  // 회원이 작성한 댓글이라면 사용자 ID와 작성자 ID 비교
  if (comment.author._id && user && userId === authorId) {
    return next();
  }

  // 비회원이 작성한 댓글이라면 요청에 담긴 비밀번호와 댓글 비밀번호 비교
  if (
    comment.hashedPassword &&
    commentPassword &&
    bcrypt.compareSync(commentPassword, comment.hashedPassword)
  ) {
    return next();
  }

  ctx.status = 401;
  return;
};

exports.write = async (ctx) => {
  const { rootPostId, rootCommentId, ...restRequestBody } = ctx.request.body;
  const withoutAuth = !ctx.state.user;

  const rootPostIdValid = mongoose.Types.ObjectId.isValid(rootPostId);
  if (!rootPostIdValid) {
    ctx.status = 400;
    return;
  }

  const rootPost = await Post.findById(rootPostId).exec();
  if (!rootPost) {
    ctx.status = 404;
    return;
  }

  const rootCommentIdValid = mongoose.Types.ObjectId.isValid(rootCommentId);
  if (rootCommentId && !rootCommentIdValid) {
    ctx.status = 400;
    return;
  }
  const rootComment = await Comment.findById(rootCommentId).exec();
  if (rootCommentId && !rootComment) {
    ctx.status = 404;
    return;
  }

  const Schema = Joi.object().keys({
    body: Validation.comment.body.required(),
    ...(withoutAuth
      ? {
          username: Validation.user.username,
          password: Validation.comment.password,
        }
      : {}),
  });

  const valid = Joi.validate(restRequestBody, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  try {
    const { body, username, password } = ctx.request.body;
    const comment = new Comment({
      rootPostId,
      ...(rootCommentId ? { rootCommentId } : {}),
      body: sanitizeHtml(body),
      author: withoutAuth
        ? { username }
        : { username: ctx.state.user.username, _id: ctx.state.user._id },
    });
    if (withoutAuth) {
      await comment.setPassword(password);
    }
    await comment.save();
    ctx.body = comment.serialize();
  } catch (e) {
    ctx.status = 500;
    return;
  }
};
