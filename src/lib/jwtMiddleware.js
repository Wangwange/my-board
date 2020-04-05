const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = (ctx, next) => {
  const token = ctx.cookies.get("access_token");
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });
    const { _id, username, membership } = decoded;
    ctx.state.user = { _id, username, membership };

    if (decoded.exp - Date.now < 1000 * 60 * 60 * 24 * 1) {
      const user = User.findByUsername(username);
      const token = user.generateToken();
      ctx.cookies.set("access_token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 1,
        httpOnly: true,
      });
    }

    return next();
  } catch (e) {
    console.log("token validation error");
    return next();
  }
};
