const Router = require("koa-router");

const posts = require("./posts");

const api = new Router();

api.get("/", (ctx) => (ctx.body = "api"));

api.use("/posts", posts.routes());

module.exports = api;
