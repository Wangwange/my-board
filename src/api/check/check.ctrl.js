const Joi = require("joi");
const bcrypt = require("bcrypt");
const Post = require("../../models/post");
const Validation = require("../../lib/validation");

exports.checkPostWrite = (ctx) => {
  const Schema = Joi.object().keys({
    username: Validation.user.username.required(),
    password: Validation.post.password.required(),
  });

  const valid = Joi.validate(ctx.request.body, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  ctx.status = 200;
};

exports.checkPostAction = async (ctx) => {
  const { id } = ctx.params;
  const { password } = ctx.request.body;

  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }

    const valid = await bcrypt.compare(password, post.hashedPassword);
    if (!valid) {
      ctx.status = 401;
      return;
    }

    ctx.status = 200;
  } catch (e) {
    ctx.status = 500;
    return;
  }
};
