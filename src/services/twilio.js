const twilio = require("twilio");

const env = require("../env");
const winston = require("winston");
const { mobilePhoneVerificationTemplate } = require("../templates/mobilePhone");

module.exports = {
  sendMobilePhoneVerificationMessage,
  sendMessage,
};

// ##############################################################################
// ##############################################################################

// Send mobilePhone verification message
async function sendMobilePhoneVerificationMessage(
  mobilePhone,
  verificationToken,
) {
  try {
    await sendMessage({
      sender: env.TWILIO_PHONE_NUMBER,
      receiver: mobilePhone,
      content: mobilePhoneVerificationTemplate(verificationToken),
    });
  } catch (err) {
    winston.error("Error sending mobilePhone verification message: ", err);
  }
}

// Send twilio message
async function sendMessage({ sender, receiver, content }) {
  const client = new twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    from: sender,
    to: receiver,
    body: content,
  });
}
