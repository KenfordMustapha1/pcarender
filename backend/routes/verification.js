const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SellerVerification = require('../models/SellerVerification');

// Multer setup to save files to 'uploads' folder
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    // Save file with original name + timestamp for uniqueness
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/verification/upload
// Upload file + save seller verification data
router.post('/upload', upload.single('idFile'), async (req, res) => {
  try {
    const { sellerName, email } = req.body;
    if (!sellerName || !email || !req.file) {
      return res.status(400).json({ message: 'All fields are required including file.' });
    }

    const newVerification = new SellerVerification({
      sellerName,
      email,
      idFileUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    });

    await newVerification.save();

    res.status(201).json({ message: 'Verification submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/verification
// Get all verification submissions
router.get('/', async (req, res) => {
  try {
    const verifications = await SellerVerification.find().sort({ submittedAt: -1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
