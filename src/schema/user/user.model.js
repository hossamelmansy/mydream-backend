const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment");
const uuidv4 = require("uuid/v4");
const pick = require("lodash/pick");
const Schema = mongoose.Schema;

const env = require("../../env");
const winston = require("../../services/winston");
const { getJwtToken } = require("../../utils/jwt");
const {
  generateRandom6Digits,
  throwInternalServerError,
} = require("../../utils");
const {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} = require("../../services/sendGrid");
const { sendMobilePhoneVerificationMessage } = require("../../services/twilio");

const UserSchema = new Schema(
  {
    name: { first: String, last: String },
    email: String,
    emailVerification: {
      token: { type: String, default: uuidv4() },
      verified: { type: Boolean, default: false },
      verifiedOn: { type: Date, default: null },
    },
    mobilePhone: String,
    mobilePhoneVerification: {
      token: { type: String, default: generateRandom6Digits() },
      verified: { type: Boolean, default: false },
      verifiedOn: { type: Date, default: null },
    },
    password: String,
    passwordReset: {
      token: { type: String, default: null },
      expiresOn: { type: Date, default: null },
    },
    refreshTokens: [{ token: String, expiresOn: Date, _id: false }],
    roles: { type: [String], default: ["USER"] },
  },
  { timestamps: true },
);

// ##############################################################################
// ##############################################################################
// Indexes
// TODO: Consider create multiple indexes

// ##############################################################################
// ##############################################################################
// Statics (model) methods

// Check if user registered by email of mobilePhone
UserSchema.statics.isRegisteredUser = async function(email, mobilePhone) {
  try {
    if (email) {
      return (await this.countDocuments({ email })) == 1;
    }
    if (mobilePhone) {
      return (await this.countDocuments({ mobilePhone })) == 1;
    }
    return false;
  } catch (err) {
    winston.error("Error while running isRegisteredUser: ", err);
    throwInternalServerError();
  }
};

// ##############################################################################
// ##############################################################################
// Instance (document) methods

// Check valid password
UserSchema.methods.isValidPassword = function(password) {
  try {
    return bcrypt.compareSync(password, this.password);
  } catch (err) {
    winston.error("Error while running isValidPassword: ", err);
    throwInternalServerError();
  }
};

// Check valid refresh token
UserSchema.methods.isValidRefreshToken = function(token) {
  try {
    let isValid = false;

    this.refreshTokens.forEach(function(refreshToken) {
      if (refreshToken.token == token && refreshToken.expiresOn > new Date()) {
        isValid = true;
      }
    });

    return isValid;
  } catch (err) {
    winston.error("Error while running isValidRefreshToken: ", err);
    throwInternalServerError();
  }
};

// Generate refresh token
UserSchema.methods.generateRefreshToken = async function(rememberMe = false) {
  try {
    const token = uuidv4();
    const expiresAfterDays = Number(
      rememberMe ? env.JWT_REF_TOKEN_EXP_REM : env.JWT_REF_TOKEN_EXP,
    );
    const expiresOn = moment()
      .add(expiresAfterDays, "d")
      .toDate();
    this.refreshTokens.push({ token, expiresOn }); // Add refresh token to user
    await this.save();

    return token;
  } catch (err) {
    winston.error("Error while running generateRefreshToken: ", err);
    throwInternalServerError();
  }
};

// Generate access token
UserSchema.methods.generateAccessToken = function() {
  try {
    const payload = pick(this, ["id", "fullName", "email", "roles"]);
    const accessToken = getJwtToken({
      expiresIn: String(env.JWT_ACC_TOKEN_EXP),
      subject: this.id,
      payload,
    });

    return accessToken;
  } catch (err) {
    winston.error("Error while running generateAccessToken: ", err);
    throwInternalServerError();
  }
};

// Send email verification email
UserSchema.methods.sendEmailVerificationEmail = function() {
  try {
    const {
      id,
      email,
      emailVerification: { token },
    } = this;

    sendEmailVerificationEmail(id, email, token);
  } catch (err) {
    winston.error("Error while running sendEmailVerificationEmail: ", err);
    throwInternalServerError();
  }
};

// Send mobilePhone verification message
UserSchema.methods.sendMobilePhoneVerificationMessage = function() {
  try {
    const {
      mobilePhone,
      mobilePhoneVerification: { token },
    } = this;

    sendMobilePhoneVerificationMessage(mobilePhone, token);
  } catch (err) {
    winston.error(
      "Error while running sendMobilePhoneVerificationMessage: ",
      err,
    );
    throwInternalServerError();
  }
};

// Check valid email verification token
UserSchema.methods.isValidEmailVerificationToken = function(token) {
  try {
    return this.emailVerification.token == token;
  } catch (err) {
    winston.error("Error while running isValidEmailVerificationToken: ", err);
    throwInternalServerError();
  }
};

// Verify user email
UserSchema.methods.verifyEmail = async function() {
  try {
    this.emailVerification.verified = true;
    this.emailVerification.verifiedOn = new Date();

    await this.save();
  } catch (err) {
    winston.error("Error while running verifyEmail: ", err);
    throwInternalServerError();
  }
};

// Check valid mobilePhone verification token
UserSchema.methods.isValidMobilePhoneVerificationToken = function(token) {
  try {
    return this.mobilePhoneVerification.token == token;
  } catch (err) {
    winston.error(
      "Error while running isValidMobilePhoneVerificationToken: ",
      err,
    );
    throwInternalServerError();
  }
};

// Verify user mobilePhone
UserSchema.methods.verifyMobilePhone = async function() {
  try {
    this.mobilePhoneVerification.verified = true;
    this.mobilePhoneVerification.verifiedOn = new Date();

    await this.save();
  } catch (err) {
    winston.error("Error while running verifyMobilePhone: ", err);
    throwInternalServerError();
  }
};

// Remove invalid refresh tokens
UserSchema.methods.removeInvalidRefreshTokens = async function() {
  try {
    this.refreshTokens.forEach(refreshToken => {
      if (refreshToken.expiresOn <= new Date()) {
        this.refreshTokens.pull(refreshToken);
      }
    });

    await this.save();
  } catch (err) {
    winston.error("Error while running removeInvalidRefreshTokens: ", err);
    throwInternalServerError();
  }
};

// Forget password
UserSchema.methods.forgetPassword = async function() {
  try {
    const expiresOn = moment()
      .add(Number(env.PASSWORD_RESET_TOKEN_EXPIRY), "h")
      .toDate();
    // update user with token
    this.passwordReset.token = uuidv4();
    this.passwordReset.expiresOn = expiresOn;
    await this.save();

    // send password reset email
    sendPasswordResetEmail(this.id, this.email, this.passwordReset.token);
  } catch (err) {
    winston.error("Error while running forgetPassword: ", err);
    throwInternalServerError();
  }
};

// Check valid password reset token
UserSchema.methods.isValidPasswordResetToken = function(token) {
  try {
    return (
      this.passwordReset.token == token &&
      this.passwordReset.expiresOn > new Date()
    );
  } catch (err) {
    winston.error("Error while running isValidPasswordResetToken: ", err);
    throwInternalServerError();
  }
};

// ##############################################################################
// ##############################################################################
// Pre (hooks) methods

// Hash password before save or update
UserSchema.pre(["save", /^update/], function() {
  try {
    if (this.isModified("password")) {
      this.password = bcrypt.hashSync(this.password, 10);
    }
  } catch (err) {
    winston.error("Error while running preUserSaveAndUpdate: ", err);
    throwInternalServerError();
  }
});

// ##############################################################################
// ##############################################################################
// Post (hooks) methods

// ##############################################################################
// ##############################################################################
// Virtuals

// ##############################################################################
// ##############################################################################
// Exports
module.exports = mongoose.model("User", UserSchema);
