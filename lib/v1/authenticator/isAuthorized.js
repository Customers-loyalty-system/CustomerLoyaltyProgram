const { unauthorized } = require("../responser/responses");

const isAuthorized = (req, res, next, roles = {}) => {
  if (
    roles[req.tokenHolder.type] ||
    (req.tokenHolder.type == "admin" &&
      req.tokenHolder.id == 1 &&
      (roles["admin"] || roles["superadmin"]))
  ) {
    const shouldMatch = roles[req.tokenHolder.type]?.matchId;
    if (!shouldMatch || (shouldMatch && req.tokenHolder.id == req?.params?.id)) {
      return next();
    } else return unauthorized(res)
  }
  return unauthorized(res);
};
module.exports = isAuthorized;
