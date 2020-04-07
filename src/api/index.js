const Router = require("koa-router");

const posts = require("./posts");
const auth = require("./auth");
const check = require("./check");

const api = new Router();

api.use("/posts", posts.routes());
api.use("/auth", auth.routes());
api.use("/check", check.routes());

module.exports = api;
