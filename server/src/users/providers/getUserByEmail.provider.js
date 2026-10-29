const User = require("../users.schema.js");

async function getUserByEmail(email) {
  try {
    if (!email) return null;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user;
  } catch (error) {
    return null;
  }
}

module.exports = getUserByEmail;