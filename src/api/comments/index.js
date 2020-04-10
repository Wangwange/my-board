const Router = require("koa-router");
const commentsCtrl = require("./comments.ctrl");

const comments = new Router();

comments.post("/", commentsCtrl.write);
comments.delete(
  "/:id",
  commentsCtrl.checkOwnComment,
  (ctx) => (ctx.body = "delete comment")
);

module.exports = comments;
