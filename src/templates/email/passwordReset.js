// Password reset email template
module.exports = function passwordResetTemplate(userId, passwordResetToken) {
  return `<div>
            <h1>Please reset your password</h1>
            <h2>Your userId: ${userId}</h2>
            <h2>Your password reset token: ${passwordResetToken}</h2>
            <h2>Link will be expired after 24 hours.</h2>
          </div>`;
};
