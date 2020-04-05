const Router = require("koa-router");
const postsCtrl = require("./posts.ctrl");

const posts = new Router();

posts.get("/", postsCtrl.list);
posts.post("/", postsCtrl.write);
posts.get("/:id", postsCtrl.checkObjectId, postsCtrl.read);
posts.patch("/:id", postsCtrl.checkObjectId, postsCtrl.update);
posts.delete("/:id", postsCtrl.checkObjectId, postsCtrl.delete);

module.exports = posts;
