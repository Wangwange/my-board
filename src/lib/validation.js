const Joi = require("joi");
const CONSTANTS = require("./constants");

module.exports = {
  user: {
    username: Joi.string()
      .min(CONSTANTS.minLength.username)
      .max(CONSTANTS.maxLength.username)
      .alphanum(),
    password: Joi.string()
      .min(CONSTANTS.minLength.password)
      .max(CONSTANTS.maxLength.password),
    adminKey: Joi.string(),
  },
  post: {
    title: Joi.string().max(CONSTANTS.maxLength.title),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()).max(CONSTANTS.maxLength.tags),
    password: Joi.string()
      .min(CONSTANTS.minLength.password)
      .max(CONSTANTS.maxLength.password),
  },
  comment: {
    body: Joi.string().max(CONSTANTS.maxLength.comment),
    password: Joi.string()
      .min(CONSTANTS.minLength.password)
      .max(CONSTANTS.maxLength.password),
  },
};
