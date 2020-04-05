require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");

const app = new Koa();
const router = new Router();
const api = require("./api");

const { PORT, MONGO_URI } = process.env;

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error(e));

router.use("/api", api.routes());

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT || 4000, () => console.log("Server started"));
