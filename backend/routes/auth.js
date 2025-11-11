const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path if needed

const router = express.Router();
const JWT_SECRET = "your_jwt_secret"; // Use environment variable in production

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = new User({ name, email, password, verified: false });
    await newUser.save();

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
      }
    });

    const verificationUrl = `http://localhost:5000/verify-email?token=${token}`;

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: 'Signup successful! Check your email to verify your account.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Signup failed' });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).send("User not found");

    user.verified = true;
    await user.save();

    res.send("Email verified successfully! You can now log in.");
  } catch (err) {
    console.error(err);
    res.status(400).send("Invalid or expired token");
  }
});

module.exports = router;
