const nodemailer = require('nodemailer');;

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "69cf0fab16b53b",
      pass: "fe2ce7a0c7de5e"
    }
  });

// Secret key for JWT
const secretKey = 'div9ghfjf768cjhgj9'; // Replace with your secret key
module.exports = transporter