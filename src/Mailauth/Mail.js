const express = require("express");
const router = new express.Router();
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');

// send mail
router.post("/register", (req, res) => {
  console.log(req.body);

  const { email, text } = req.body;
  

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        port: 465,
        secure: true,
        logger:true,
        debug:true,
        port:465,
        secureConnection:false,
        user: "saran07rose@gmail.com",
        pass: "dydnwqiyqkqovfpd",
      },
    });

    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });

    const mailOptions = {
      from: "saran07rose@gmail.com",
      to: email,
      subject: "Here from saran!",
      html: `<h1 style={{color:'red'}}>Alert *</h1> <h3> You have to pay your fees this month before </h3> <p>${text, otp}</p>`,
    };  

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error" + error);
      } else {
        console.log("Email sent:" + info.response);
        res.status(201).json({ status: 201, info });
      }
    });
  } catch (error) {
    console.log("Error" + error);
    res.status(401).json({ status: 401, error });
  }
});

module.exports = router;
