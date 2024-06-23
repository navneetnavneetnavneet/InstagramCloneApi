const nodemailer = require("nodemailer");
const ErrorHandler = require("./ErrorHandler");

exports.sendmail = (req, res, next, url) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.MAIL_EMAIL_ADDRESS,
      pass: process.env.MAIL_EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Nodemailer Private Limited",
    to: req.body.email,
    subject: "Password Reset Link",
    html: `<h1>Click link below to reset password</h1>
      <a href="${url}">Password Reset Link</a>`,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      return next(new ErrorHandler(err, 500));
    }
    return res.status(200).json({
      message: "mail send Successfully",
      url,
    });
  });
  
};
