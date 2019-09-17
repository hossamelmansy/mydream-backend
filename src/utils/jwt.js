const jwt = require("jsonwebtoken");

const env = require("../env");

module.exports = {
  getJwtToken,
  getJwtPayload,
};

// ##############################################################################
// ##############################################################################

// Get Jwt token from payload
function getJwtToken({ expiresIn, subject, payload }) {
  const token = jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn,
    subject,
    issuer: env.JWT_ISSUER,
  });

  return token;
}

// Get payload from Jwt token
function getJwtPayload(token) {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: env.JWT_ISSUER,
  });

  return payload;
}
