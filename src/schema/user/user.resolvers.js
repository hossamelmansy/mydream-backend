const User = require("./user.model");
const { ERRORS, throwError } = require("../../utils");

module.exports = {
  Query: {
    user,
    users,
    currentUser,
    renewAccessToken,
    isValidPasswordReset,
  },
  Mutation: {
    signup,
    login,
    verifyEmail,
    verifyMobilePhone,
    forgetPassword,
    resetPasswordWithToken,
  },
  User: {
    id(parent) {
      return parent._id;
    },
    firstName(parent) {
      return parent.name.first;
    },
    lastName(parent) {
      return parent.name.last;
    },
  },
};

// ##############################################################################
// ##############################################################################
// Query

// Get user by id or email
function user(parent, args) {
  const { userId, email } = args.input;

  if (userId) {
    return User.findById(userId)
      .lean()
      .exec();
  }
  if (email) {
    return User.findOne({ email })
      .lean()
      .exec();
  }
  return null;
}

// Get list of users
function users() {
  return User.find({})
    .lean()
    .exec();
}

// Get logged in user
function currentUser(parent, args, context) {
  return User.findById(context.user.id)
    .lean()
    .exec();
}

// Renew access token
async function renewAccessToken(parent, args) {
  const { userId, refreshToken } = args.input;

  // Check valid user
  const user = await User.findById(userId).exec();
  if (!user) {
    throwError(ERRORS.CUSTOM, "User not found.", "USER_NOT_FOUND");
  }

  await user.removeInvalidRefreshTokens(); // Remove invalid refresh tokens

  // Check valid refresh token
  if (!user.isValidRefreshToken(refreshToken)) {
    throwError(
      ERRORS.CUSTOM,
      "Invalid refresh token.",
      "INVALID_REFRESH_TOKEN",
    );
  }

  // Generate access token
  const accessToken = await user.generateAccessToken();

  return { accessToken };
}

// Check is valid password reset request
async function isValidPasswordReset(parent, args) {
  const { userId, passwordResetToken } = args.input;

  // Check valid user
  const user = await User.findById(userId).exec();
  if (!user) {
    throwError(ERRORS.CUSTOM, "User not found.", "USER_NOT_FOUND");
  }

  // Check valid password reset token
  if (!user.isValidPasswordResetToken(passwordResetToken)) {
    throwError(
      ERRORS.CUSTOM,
      "Invalid password reset token.",
      "INVALID_PASSWORD_RESET_TOKEN",
    );
  }

  return true;
}

// ##############################################################################
// ##############################################################################
// Mutation

// Signup user
async function signup(parent, args) {
  const { firstName, lastName, email, mobilePhone, password } = args.input;

  // Check email exist
  if (await User.isRegisteredUser(email)) {
    throwError(ERRORS.CUSTOM, "This email registered before.", "EMAIL_TAKEN");
  }

  // Create new user
  const user = await User.create({
    name: { first: firstName, last: lastName },
    email,
    mobilePhone,
    password,
  });
  user.sendEmailVerificationEmail(); // Send verification email
  user.sendMobilePhoneVerificationMessage(); // Send verification mobilePhone message

  // Login user and get refresh and access tokens
  const refreshToken = await user.generateRefreshToken();
  const accessToken = await user.generateAccessToken();

  return { accessToken, refreshToken };
}

// Login user
async function login(parent, args) {
  const { email, password, rememberMe } = args.input;

  // Check if user exist
  if (email && !(await User.isRegisteredUser(email))) {
    throwError(ERRORS.CUSTOM, "User not found.", "USER_NOT_FOUND");
  }

  // Get user document
  const user = await User.findOne({
    email,
  }).exec();
  // Check valid password
  if (!user.isValidPassword(password)) {
    throwError(ERRORS.CUSTOM, "Invalid email or password", "INVALID_LOGIN");
  }

  await user.removeInvalidRefreshTokens(); // Remove invalid refresh tokens

  // Login user and get refresh and access tokens
  const refreshToken = await user.generateRefreshToken(rememberMe);
  const accessToken = await user.generateAccessToken();

  return { accessToken, refreshToken };
}

// Verify user email
async function verifyEmail(parent, args) {
  const { userId, verificationToken } = args.input;

  // Check valid user
  const user = await User.findById(userId).exec();
  if (!user) {
    throwError(ERRORS.CUSTOM, "User not found.", "USER_NOT_FOUND");
  }

  // Check if email already verified
  if (user.emailVerification.verified) {
    throwError(
      ERRORS.CUSTOM,
      "Email already verified.",
      "EMAIL_ALREADY_VERIFIED",
    );
  }

  // Check valid email verification token
  if (!user.isValidEmailVerificationToken(verificationToken)) {
    throwError(
      ERRORS.CUSTOM,
      "Invalid email verification token.",
      "INVALID_EMAIL_VERIFICATION_TOKEN",
    );
  }

  // Verify user email
  await user.verifyEmail();

  return true;
}

// Verify user mobilePhone
async function verifyMobilePhone(parent, args) {
  const { userId, verificationToken } = args.input;

  // Check valid user
  const user = await User.findById(userId).exec();
  if (!user) {
    throwError(ERRORS.CUSTOM, "User not found.", "USER_NOT_FOUND");
  }

  // Check if mobilePhone already verified
  if (user.mobilePhoneVerification.verified) {
    throwError(
      ERRORS.CUSTOM,
      "Mobile phone already verified.",
      "MOBILE_PHONE_ALREADY_VERIFIED",
    );
  }

  // Check valid mobilePhone verification token
  if (!user.isValidMobilePhoneVerificationToken(verificationToken)) {
    throwError(
      ERRORS.CUSTOM,
      "Invalid mobile phone verification token.",
      "INVALID_MOBILE_PHONE_VERIFICATION_TOKEN",
    );
  }

  // Verify user mobilePhone
  await user.verifyMobilePhone();

  return true;
}

// Forget password and send password reset email
async function forgetPassword(parent, args) {
  const { email } = args.input;

  // Check valid user
  const user = await User.findOne({ email }).exec();
  if (!user) {
    throwError(ERRORS.CUSTOM, "User not found.", "USER_NOT_FOUND");
  }

  // Check if token not expired yet
  if (user.passwordReset.token && user.passwordReset.expiresOn > new Date()) {
    throwError(
      ERRORS.CUSTOM,
      "Password reset token still valid, cannot generate new one.",
      "VALID_PASSWORD_RESET_TOKEN",
    );
  }

  await user.forgetPassword();

  return true;
}

// Reset user password with forget password token
async function resetPasswordWithToken(parent, args) {
  const { userId, passwordResetToken, password } = args.input;

  // Check valid user
  const user = await User.findById(userId).exec();
  if (!user) {
    throwError(ERRORS.CUSTOM, "User not found.", "USER_NOT_FOUND");
  }

  // Check valid password reset token
  if (!user.isValidPasswordResetToken(passwordResetToken)) {
    throwError(
      ERRORS.CUSTOM,
      "Invalid password reset token.",
      "INVALID_PASSWORD_RESET_TOKEN",
    );
  }

  // update password
  user.password = password;
  await user.save();

  return true;
}
