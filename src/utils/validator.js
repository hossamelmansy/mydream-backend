const validator = require("validator");
const mongoose = require("mongoose");
const moment = require("moment");

const { ERRORS, throwError } = require("./index");

module.exports = {
  isObjectId,
  isEmail,
  isMobilePhone,
  isPassword,
  isDateTime,
};

// ##############################################################################
// ##############################################################################

// Check valid Mongodb ObjectId
function isObjectId(value = "", options = { error: false }) {
  var { error = false } = options;
  var valid = mongoose.Types.ObjectId.isValid(value.trim());

  return error && !valid
    ? throwError(
        ERRORS.CUSTOM,
        "ObjectId failed validation",
        "INVALID_OBJECT_ID",
      )
    : valid;
}

// Check valid email
function isEmail(value = "", options = { error: false }) {
  var { error = false } = options;
  var valid = validator.isEmail(value.trim());

  return error && !valid
    ? throwError(
        ERRORS.CUSTOM,
        "Email address failed validation",
        "INVALID_EMAIL",
      )
    : valid;
}

// Check valid mobile phone
function isMobilePhone(
  value = "",
  options = { locale: "ar-EG", error: false },
) {
  var { locale = "ar-EG", error = false } = options;
  var valid = validator.isMobilePhone(value.trim(), locale, {
    strictMode: true,
  });

  return error && !valid
    ? throwError(
        ERRORS.CUSTOM,
        "Mobile Phone failed validation",
        "INVALID_MOBILE_PHONE",
      )
    : valid;
}

// Check valid password
function isPassword(value = "", options = { error: false }) {
  var { error = false } = options;
  var valid = !validator.isEmpty(value);

  return error && !valid
    ? throwError(
        ERRORS.CUSTOM,
        "Password failed validation",
        "INVALID_PASSWORD",
      )
    : valid;
}

// Check valid dateTime
function isDateTime(value = "", options = { error: false }) {
  var { error = false } = options;
  var valid = moment(value).isValid();

  return error && !valid
    ? throwError(
        ERRORS.CUSTOM,
        "DateTime failed validation",
        "INVALID_DATETIME",
      )
    : valid;
}
