const Router = require("koa-router");
const {
  list,
  write,
  read,
  update,
  remove,
  getPostById,
  checkOwnPost,
} = require("./posts.ctrl");

const posts = new Router();
const post = new Router();

posts.get("/", list);
posts.post("/", write);

post.get("/", getPostById, read);
post.patch("/", getPostById, checkOwnPost, update);
post.delete("/", getPostById, checkOwnPost, remove);
posts.use("/:id", post.routes());

module.exports = posts;
