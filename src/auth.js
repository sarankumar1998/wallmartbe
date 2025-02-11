const express = require("express");
const con = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var moment = require("moment");
const file = require("./dumm.json")
const nodemailer = require("nodemailer");

// console.log(pwd);

const router = express.Router();


router.post("/register", async (req, res) => {
  // Check if the user already exists
  const alreadyUser = "SELECT * FROM users WHERE username = ?";
  
  con.query(alreadyUser, [req.body.username], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    if (data.length) return res.status(409).json("User already exists!");

    // Hash the password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const newUser = `
      INSERT INTO users 
      (email, username, password, dob, country, mobile, createdOn) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      req.body.email,
      req.body.username,
      hashedPassword,
      req.body.dob,
      req.body.country,
      req.body.mobile,
      moment().format("YYYY-MM-DD HH:mm:ss"),
    ];

    con.query(newUser, values, (err, data) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json("User has been created.");
    });
  });
})

router.post("/login", async (req, res) => {
  const userLogin = "SELECT * FROM users WHERE username = ?";
  con.query(userLogin, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");
    let user = data[0];
    const checkPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!checkPassword) return res.status(400).json("Wrong password or username!");
    delete user.password;
    const token = jwt.sign({ id: user.id, username: user.username }, "secretkey", { expiresIn: "1200s" });
    res.status(200).json({ token: token });
  });
});


router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

function checkToken(req, res, next) {
  let token = req.headers["authorization"]
  token = token.replace("Bearer ", "")
  console.log(token)
  if (token) {
    jwt.verify(token, "secretkey", (err, decoded) => {
      if (err) {
        res.status(401).send({ message: 'access denied' })
        return;
      }
      req.id = decoded.id
      next();
    })
  } else {
    res.sendStatus(401); // Unauthorized
  }
}


router.get("/detail", checkToken, (req, res) => {
  const fil = file.filter((e) => e.id === req.id)
  res.status(200).send({ fil: fil })
})



router.put("/profile/update/:id", (req, res) => {
  var { id } = req.params;
  var { email, username, country, dob, mobile, password } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  var getPasswordQuery = `SELECT password FROM users WHERE id=${id}`;

  con.query(getPasswordQuery, (error, result) => {
    if (error) return res.status(500).json(error);
    if (result.length === 0) return res.status(404).json("User not found");

    const existingPassword = result[0].password;
    const passwordMatch = bcrypt.compareSync(password, existingPassword);

    if (!passwordMatch) return res.status(401).json("Invalid password");

    var dobFormatted = dob ? moment(dob).format("YYYY-MM-DD") : null;

    var query = `UPDATE users 
                 SET email='${email}', username='${username}', password='${hashedPassword}', 
                     country='${country}', dob='${dobFormatted}', mobile='${mobile}', 
                     createdOn='${moment().format("YYYY-MM-DD HH:mm:ss")}' 
                 WHERE id=${id}`;

    con.query(query, (error, data) => {
      if (error) return res.status(500).json(error);
      res.status(200).json({ message: 'Update done' });
    });
  });
});


router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    con.query('SELECT * FROM users WHERE email = ?', email, async (error, results) => {
      if (error) throw error;
      if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
      } else {
        const user = results[0];
        const resetToken = jwt.sign({ userId: user.id }, 'reset-secret-key', { expiresIn: "60s" });
        // const token = jwt.sign({ id: user.id, username: user.username }, "secretkey", { expiresIn: "1200s" });
        console.log(resetToken);

        // Create a nodemailer transporter
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
            pass: "uhbzqfbrgjhfvezy",
          },
        });

         // Encode the token for URL safety
         const encodedToken = encodeURIComponent(resetToken);

        // Define email content
        const mailOptions = {
          from: "saran07rose@gmail.com",
          to: email,
          subject: 'Password Reset',
          html: `<p>Click <a href="http://ec2-44-204-186-150.compute-1.amazonaws.com:3000/reset/auth/${encodedToken}">here</a> to reset your password.</p>`
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
          } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ message: 'Reset email sent successfully' });
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error requesting reset' });
  }
});



router.post('/reset', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify and decode the reset token
    jwt.verify(resetToken, 'reset-secret-key', async (error, decoded) => {
      if (error) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      if(!newPassword){
        return res.status(400).json({error:"user not found"})
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const userId = decoded.userId;

      // Update user's password in the database
      con.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (updateError, updateResults) => {
        if (updateError) throw updateError;
        res.status(200).json({ message: 'Password reset successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting password' });
  }
});

module.exports = router;


