const Router = require("koa-router");
const authCtrl = require("./auth.ctrl");

const auth = new Router();

auth.post("/login", authCtrl.login);
auth.post("/logout", authCtrl.logout);
auth.post("/register", authCtrl.register);
auth.get("/check", authCtrl.check);

module.exports = auth;
