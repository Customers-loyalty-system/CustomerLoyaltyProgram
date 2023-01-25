const { unauthorized } = require("../responser/responses");

const isAuthorized = (req, res, next, roles = {}) => {
  if (
    roles[req.user.type] ||
    (req.user.type == "admin" &&
      req.user.id == 1 &&
      (roles["admin"] || roles["superadmin"]))
  ) {
    const shouldMatch = roles[req.user.type]?.matchId;
    if (!shouldMatch || (shouldMatch && req.user.id == req.params.id)) {
      return next();
    }
  }
  return unauthorized(res);
};
module.exports = isAuthorized;
