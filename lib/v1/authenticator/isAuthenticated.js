const { unauthenticated } = require("../responser/responses");
const { verifyToken } = require("../tokenManager/token");

const isAuthenticated = (req, res, next) => {
  const auth = req?.headers?.authorization;
  if (!auth) {
    return unauthenticated(res);
  }
  const token = auth.split(" ");
  const tokenHolder = verifyToken(token[token.length - 1]);
  if (tokenHolder) {
    req.tokenHolder = tokenHolder;
    return next();
  }
  return unauthenticated(res);
};

module.exports = isAuthenticated;
