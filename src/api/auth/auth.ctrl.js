const Joi = require("joi");
const User = require("../../models/user");

// 회원 등록 - (username, password) => (id, username, authority)
// POST /api/auth/register
exports.register = async (ctx) => {
  const Schema = Joi.object().keys({
    username: Joi.string().min(2).max(10).alphanum().required(),
    password: Joi.string().min(4).max(10).required(),
    adminKey: Joi.string(),
  });

  const valid = Joi.validate(ctx.request.body, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  try {
    const { username, password, adminKey } = ctx.request.body;

    const occupiedUsername = await User.exists({ username });
    if (occupiedUsername) {
      ctx.status = 409;
      return;
    }

    const user = new User({
      username,
      membership:
        adminKey && adminKey === process.env.ADMIN_KEY ? "admin" : "normal",
    });
    await user.setPassword(password);
    await user.save();

    const token = user.generateToken();
    ctx.cookies.set("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 1,
      httpOnly: true,
    });
    ctx.body = user.serialize();
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 로그인 - (username, password) => (id, username, authority)
// POST /api/auth/register
exports.login = async (ctx) => {
  const { username, password } = ctx.request.body;

  if (!username || !password) {
    ctx.status = 400;
    return;
  }

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      ctx.status = 400;
      return;
    }

    const valid = await user.checkPassword(password);
    if (!valid) {
      ctx.status = 401;
      return;
    }

    const token = user.generateToken();
    ctx.cookies.set("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 1,
      httpOnly: true,
    });
    ctx.body = user.serialize();
  } catch (e) {
    ctx.status = 500;
    return;
  }
};

// 로그아웃 - () => void
// POST /api/auth/logout
exports.logout = async (ctx) => {
  ctx.cookies.set("access_token");
  ctx.status = 204;
};

// 로그인 체크 - () => (id, username, authority)
// POST /api/auth/register
// jwtMiddleware를 거쳐 ctx에 탑재된 사용자 정보 체크
exports.check = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = user;
};
