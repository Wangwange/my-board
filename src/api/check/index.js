const Router = require("koa-router");
const checkCtrl = require("./check.ctrl");

const check = new Router();
const checkPost = new Router();
const checkComment = new Router();

checkPost.post("/write", checkCtrl.checkPostWrite);
checkPost.post("/update/:id", checkCtrl.checkPostAction);
checkPost.post("/delete/:id", checkCtrl.checkPostAction);

checkComment.post("/delete/:id", checkCtrl.checkCommentAction);

check.use("/post", checkPost.routes());
check.use("/comment", checkComment.routes());

module.exports = check;
