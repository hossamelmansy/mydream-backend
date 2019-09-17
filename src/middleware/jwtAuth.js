const passport = require("passport");

// Extract user from accessToken
module.exports = function jwtAuthMiddleware(req, res, next) {
  passport.authenticate("jwt", { session: false }, function(err, user) {
    req.user = user === false ? null : user;
    next();
  })(req, res, next);
};
