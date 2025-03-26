require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,

  SMTP_CONFIG: {
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
};
