const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const env = require("../env");

// JWT options
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  algorithms: ["HS256"],
  secretOrKey: env.JWT_SECRET,
  issuer: env.JWT_ISSUER,
};

// JWT Strategy
passport.use(
  new JwtStrategy(options, function(jwtPayload, done) {
    return done(null, jwtPayload);
  }),
);
