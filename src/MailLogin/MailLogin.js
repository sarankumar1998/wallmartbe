const express = require('express');
const router = express();
const nodemailer = require('nodemailer');
const con = require("../db");

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "saran07rose@gmail.com",
    pass: "dydnwqiyqkqovfpd",
  }
});


// Generate and store OTP for a user
router.post('/generate-otp', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000); 
  const otpExpiryTime = new Date().getTime() + 5 * 60 * 1000; 

  // Store the OTP and expiry time in the database
  const query = `INSERT INTO maillogin (email, otp, exptime) VALUES (?, ?, ?)`;
  con.query(query, [email, otp, otpExpiryTime], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to generate OTP.' });
    }



    const mailOptions = {
      from: 'saran07rose@gmail.com',
      to: email,
      subject: 'OTP for Login',
      html: `
      <div style="background-color: #f5f5f5; padding: 20px;">
        <h2>Welcome to YourApp!</h2>
        <p>Thank you for registering with us. Please use the OTP below to login:</p>
        <h3 style="background-color: #ffffff; padding: 10px;">${otp}</h3>
        <p style="margin-top: 20px;">This OTP is valid for 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <p>Regards,</p>
        <p>Saran</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to send OTP.' });
      }

      res.status(200).json({ message: 'OTP generated and sent successfully.' });
    });
  });
});


// Verify OTP for user login
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const currentTimestamp = new Date().getTime();

  // Check if the provided OTP matches the stored OTP for the user
  const query = `SELECT * FROM maillogin WHERE email = ? AND otp = ?`;
  con.query(query, [email, otp], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to verify OTP.' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    const otpExpiryTime = results[0].exptime;
    console.log(otpExpiryTime,"otpExpiryTime");

    
    if (currentTimestamp > otpExpiryTime) {
      // OTP has expired
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    // Delete the OTP from the database after successful verification
    const deleteQuery = `DELETE FROM maillogin WHERE email = ?`;
    con.query(deleteQuery, [email], (error, deleteResult) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to verify OTP.' });
      }

      res.json({ message: 'OTP verified successfully.' });
    });
  });
});

module.exports = router;
