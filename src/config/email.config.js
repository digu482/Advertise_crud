const nodemailer = require('nodemailer');
require("dotenv").config();
const { user , pass } = process.env;

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: user,
      pass: pass
    }
  });

module.exports = transporter