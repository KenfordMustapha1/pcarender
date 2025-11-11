const express = require('express');
const router = express.Router();
const Verification = require('../models/Verification');

// Approve seller
router.put('/admin/approve-seller/:id', async (req, res) => {
  try {
    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );
    if (!verification) return res.status(404).json({ message: 'Verification not found' });
    res.json(verification);
  } catch (err) {
    res.status(500).json({ message: 'Server error during approval' });
  }
});

// Reject seller
router.put('/admin/reject-seller/:id', async (req, res) => {
  try {
    const verification = await Verification.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    );
    if (!verification) return res.status(404).json({ message: 'Verification not found' });
    res.json(verification);
  } catch (err) {
    res.status(500).json({ message: 'Server error during rejection' });
  }
});

// Delete verification
router.delete('/admin/delete-verification/:id', async (req, res) => {
  try {
    const result = await Verification.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Verification not found' });
    res.json({ message: 'Verification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during deletion' });
  }
});

module.exports = router;
