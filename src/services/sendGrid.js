const sgMail = require("@sendgrid/mail");

const env = require("../env");
const winston = require("./winston");
const {
  emailVerificationTemplate,
  passwordResetTemplate,
} = require("../templates/email/");

sgMail.setApiKey(env.SENDGRID_API_KEY);

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendEmail,
};

// ##############################################################################
// ##############################################################################

// Send password reset email
async function sendPasswordResetEmail(userId, email, passwordResetToken) {
  const content = passwordResetTemplate(userId, passwordResetToken);

  try {
    await sendEmail({
      sender: { email: env.JWT_ISSUER, name: "MYDREAM" },
      receiver: email,
      subject: "Reset your MYDREAM account",
      content,
    });
  } catch (err) {
    winston.error("Error sending password reset email: ", err);
  }
}

// Send email verification email
async function sendEmailVerificationEmail(userId, email, verificationToken) {
  const content = emailVerificationTemplate(userId, verificationToken);

  try {
    await sendEmail({
      sender: { email: env.JWT_ISSUER, name: "MYDREAM" },
      receiver: email,
      subject: "Verify your MYDREAM account",
      content,
    });
  } catch (err) {
    winston.error("Error sending verification email: ", err);
  }
}

// Send email
async function sendEmail({ sender, receiver, subject, content }) {
  await sgMail.send({
    from: sender,
    to: receiver,
    subject,
    html: content,
    trackingSettings: { clickTracking: { enable: true } },
  });
}
