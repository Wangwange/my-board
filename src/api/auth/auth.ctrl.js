const Joi = require("joi");
const User = require("../../models/user");

// 회원 등록 - POST /api/auth/register
exports.register = async (ctx) => {
  //검증용 스키마
  const Schema = Joi.object().keys({
    username: Joi.string().min(2).max(10).alphanum().required(),
    password: Joi.string().min(4).max(10).required(),
    adminKey: Joi.string(),
  });

  // 검증 결과
  const valid = Joi.validate(ctx.request.body, Schema);
  if (valid.error) {
    ctx.status = 400;
    return;
  }

  try {
    const { username, password, adminKey } = ctx.request.body;

    // 이미 있는 사용자명이면 실패
    const occupiedUsername = await User.exists({ username });
    if (occupiedUsername) {
      ctx.status = 409;
      return;
    }

    // 사용자 생성
    // 올바른 Admin Key가 요청에 담겨 있으면 Admin 권한으로 사용자 생성
    const user = new User({
      username,
      membership:
        adminKey && adminKey === process.env.ADMIN_KEY ? "admin" : "normal",
    });
    await user.setPassword(password);
    await user.save();

    // 인증용 토큰 발급
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

// 로그인 - POST /api/auth/register
exports.login = async (ctx) => {
  const { username, password } = ctx.request.body;

  // 사용자명 혹은 비밀번호가 없으면 실패
  if (!username || !password) {
    ctx.status = 400;
    return;
  }

  try {
    // 존재하는 사용자인지 확인
    const user = await User.findByUsername(username);
    if (!user) {
      ctx.status = 400;
      return;
    }

    // 비밀번호가 일치하는지 확인
    const valid = await user.checkPassword(password);
    if (!valid) {
      ctx.status = 401;
      return;
    }

    // 인증용 토큰 발급
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

// 로그아웃 - POST /api/auth/logout
exports.logout = async (ctx) => {
  // 토큰 소멸
  ctx.cookies.set("access_token");
  ctx.status = 204;
};

// 로그인 체크 - POST /api/auth/register
exports.check = async (ctx) => {
  // jwtMiddleware를 거쳐 ctx에 탑재된 사용자 정보 체크
  const { user } = ctx.state;
  if (!user) {
    ctx.status = 401;
    return;
  }
  ctx.body = user;
};
