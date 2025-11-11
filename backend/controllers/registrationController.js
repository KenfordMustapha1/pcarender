const Registration = require('../models/Registration');

// Get all registrations (summary)
exports.getRegistrationsSummary = async (req, res) => {
  try {
    const registrations = await Registration.find({}, 'applicationType previousPcaRegistrationNumber validityperiod dateRegistration status registeredbusinessname registrationnumber');
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get full details of one registration
exports.getRegistrationById = async (req, res) => {
  const { id } = req.params;
  try {
    const registration = await Registration.findById(id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update application status (Accept / Reject)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate input
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const updated = await Registration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};