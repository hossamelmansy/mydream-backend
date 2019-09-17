// Email verification email template
module.exports = function emailVerificationTemplate(
  userId,
  emailVerificationToken,
) {
  return `<div>
            <h1>Please confirm your email</h1>
            <h2>Your userId: ${userId}</h2>
            <h2>Your email verification token: ${emailVerificationToken}</h2>
          </div>`;
};
