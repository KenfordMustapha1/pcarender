const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');


// Get all registrations summary
router.get('/registrations/summary', registrationController.getRegistrationsSummary);

// Get single registration by ID
router.get('/registrations/:id', registrationController.getRegistrationById);

// Update status (Accept or Reject)
router.patch('/registrations/:id/status', registrationController.updateStatus);


module.exports = router;
