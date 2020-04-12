require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");
const jwtMiddleware = require("./lib/jwtMiddleware");
const serve = require("koa-static");
const send = require("koa-send");
const path = require("path");

// const createFakePosts = require("./lib/createFakePosts");

const app = new Koa();
const router = new Router();
const api = require("./api");

const { PORT, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log("MongoDB connected");
    // createFakePosts();
  })
  .catch((e) => console.error(e));

router.use("/api", api.routes());

app.use(bodyParser());
app.use(jwtMiddleware);
app.use(router.routes()).use(router.allowedMethods());

const buildDirectory = path.resolve(__dirname, "../../front/build");
app.use(serve(buildDirectory));
app.use(async (ctx) => {
  if (ctx.status === 404 && ctx.path.indexOf("/api") !== 0) {
    await send(ctx, "index.html", { root: buildDirectory });
  }
});

app.listen(PORT || 4000, () => console.log("Server started"));
