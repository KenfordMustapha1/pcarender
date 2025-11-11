// // routes/user.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/user');

// // Get total number of users
// router.get('/count', async (req, res) => {
//   try {
//     const total = await User.countDocuments();
//     res.json({ total });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to count users' });
//   }
// });

// // Get monthly registration data
// router.get('/monthly-registrations', async (req, res) => {
//   try {
//     const monthlyData = await User.aggregate([
//       {
//         $group: {
//           _id: { $month: '$createdAt' },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: 1 } }
//     ]);

//     // Fill in all months (even with 0)
//     const result = Array(12).fill(0);
//     monthlyData.forEach(item => {
//       result[item._id - 1] = item.count;
//     });

//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to get monthly data' });
//   }
// });

// module.exports = router;
