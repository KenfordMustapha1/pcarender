const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
//  STEP 1: ADD http and socket.io imports
const http = require('http');
const socketIo = require('socket.io');
// Load environment variables
dotenv.config();
// Models
const User = require('./models/User');
const Seller = require('./models/Seller');
const Product = require('./models/Product');
const CartItem = require('./models/CartItem');
const Registration = require('./models/Registration');
const Follower = require('./models/Follower');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
// Models from old server (ensure these exist)
const CutPermit = require('./models/CutPermit');
const TransportPermit = require('./models/TransportPermit');
// --- NEW: Payment Method Model ---
const PaymentMethodSchema = new mongoose.Schema({
  storeEmail: { type: String, required: true, unique: true },
  gcash: {
    number: String,
    qrCode: String, // filename of the uploaded image
  },
  paymaya: {
    number: String,
    qrCode: String,
  },
  bank: {
    number: String,
    qrCode: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const PaymentMethod = mongoose.model('PaymentMethod', PaymentMethodSchema);
// --- END NEW: Payment Method Model ---
// Initialize app
const app = express();
// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Create uploads directory and subfolder if not exist
const uploadDir = path.join(__dirname, 'uploads');
const verificationUploadDir = path.join(uploadDir, 'seller-verification');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(verificationUploadDir)) {
  fs.mkdirSync(verificationUploadDir, { recursive: true });
}
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// CORS middleware
// --- MODIFIED: Use environment variable for allowed origins ---
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000', // Use env var, fallback to localhost
  // Add other allowed origins if needed, like staging URL
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
    }
  },
  credentials: true,
}));
// --- NEW: Payment Method Upload Middleware ---
const paymentUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (req.url.includes('/api/verification/upload')) {
        cb(null, verificationUploadDir);
      } else {
        cb(null, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  }), // Use the same 'storage' defined earlier
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (mime && ext) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed for payment QR codes'), false);
    }
  }
});
// --- END NEW: Payment Method Upload Middleware ---
// Multer setup (for other uploads like products, verification)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.url.includes('/api/verification/upload')) {
      cb(null, verificationUploadDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    mime && ext ? cb(null, true) : cb(new Error('Only images and PDFs are allowed'));
  }
});
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use host/port if you're not using Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // <-- Add this to fix the self-signed cert issue
  }
});
//  STEP 2: CREATE HTTP SERVER AND SOCKET.IO INSTANCE
const server = http.createServer(app);
const io = socketIo(server, {
  // --- MODIFIED: Use environment variable for Socket.IO CORS origins ---
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000", // Use env var
      // Add other allowed origins if needed
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
//  STEP 3: SOCKET.IO LOGIC (REAL-TIME CHAT)
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);
  // Join the chat room (buyer + seller)
  socket.on('join-chat', ({ buyerEmail, sellerEmail }) => {
    const room = [buyerEmail, sellerEmail].sort().join('-');
    socket.join(room);
    console.log(`👤 User joined room: ${room}`);
  });
  // Send message handler
  socket.on('send-message', async (data) => {
    const { buyerEmail, sellerEmail, text, sender } = data;
    const room = [buyerEmail, sellerEmail].sort().join('-');
    try {
      // Save the message to MongoDB
      const msg = new Message({
        from: sender,
        to: sender === buyerEmail ? sellerEmail : buyerEmail,
        text,
        type: 'text',
        read: false
      });
      await msg.save();
      // ✅ Emit to everyone *except* the sender to prevent duplication
      socket.to(room).emit('receive-message', msg);
      console.log(`💬 Message sent in room: ${room}`);
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });
  // Add new handler for send-image
  socket.on('send-image', async (data) => {
    const { buyerEmail, sellerEmail, imageUrl, sender } = data; // imageUrl is now expected to be the full URL
    const room = [buyerEmail, sellerEmail].sort().join('-');
    try {
      const msg = new Message({
        from: sender,
        to: sender === buyerEmail ? sellerEmail : buyerEmail,
        // Store the full URL received from the client (constructed in the /api/messages/image route)
        imageUrl: imageUrl,
        type: 'image',
        read: false
      });
      await msg.save();
      socket.to(room).emit('receive-image', {
        ...msg.toObject(),
        read: false
      });
      console.log(`🖼️ Image sent in room: ${room}`);
    } catch (error) {
      console.error('❌ Error saving image message:', error);
    }
  });
  // When user disconnects
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});
// --- EMAIL NOTIFICATION HELPER FUNCTION (from old server) ---
// ✅ EMAIL NOTIFICATION HELPER FUNCTION - Updated to include Certificate Attachment
const sendNotificationEmail = async (email, businessName, status, applicationType, registrationData = null) => {
  try {
    const statusText = status === 'accepted' ? 'Approved' : 'Rejected';
    const statusColor = status === 'accepted' ? '#28a745' : '#dc3545';
    const mailOptions = {
      to: email,
      from: '"Philippine Coconut Authority" <pcaphilippinecoconutauthority@gmail.com>',
      subject: `Application ${statusText} - PCA Registration`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Application ${statusText}</h2>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">Dear Applicant,</p>
            <p style="font-size: 16px; color: #333;">
              We are writing to inform you that your <strong>${applicationType}</strong> application has been <strong style="color: ${statusColor};">${statusText}</strong>.
            </p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Business Name:</strong> ${businessName}</p>
              <p style="margin: 5px 0;"><strong>Application Type:</strong> ${applicationType}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor};">${statusText}</span></p>
            </div>
            ${status === 'accepted' 
              ? '<p style="font-size: 16px; color: #333;">Congratulations! Your application has been approved. Please find the attached Certificate of Registration. You may proceed with the next steps as outlined in your application guidelines.</p>' 
              : '<p style="font-size: 16px; color: #333;">Unfortunately, your application has been rejected. If you have any questions regarding this decision, please contact our office.</p>'
            }
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br/>
              <strong>Philippine Coconut Authority</strong>
            </p>
          </div>
          <div style="background-color: #333; color: #fff; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `
    };
    // Attach certificate if accepted and registrationData is provided
    if (status === 'accepted' && registrationData) {
      try {
        const generateCertificate = require('./utils/generateCertificate'); // Adjust path if necessary
        const pdfBuffer = await generateCertificate(registrationData);
        mailOptions.attachments = [
          {
            filename: `Certificate_of_Registration_${businessName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ];
      } catch (certError) {
        console.error('❌ Error generating or attaching certificate:', certError);
        // Optionally, you could still send the email without the certificate
        // Or modify the HTML message to indicate the certificate couldn't be generated
      }
    }
    await transporter.sendMail(mailOptions);
    console.log(`✅ Notification email sent to ${email}`);
    if (mailOptions.attachments) {
        console.log(`📄 Certificate attached for ${businessName}`);
    }
    return true;
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    return false;
  }
};
// Get notifications for a user
app.get('/api/notifications', async (req, res) => {
  const { userEmail } = req.query;
  if (!userEmail) {
    return res.status(400).json({ msg: 'userEmail is required' });
  }
  try {
    const notifications = await Notification.find({ userEmail })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({
      userEmail,
      isRead: false
    });
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ msg: 'Failed to fetch notifications' });
  }
});
// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.json({ msg: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ msg: 'Failed to update notification' });
  }
});
// Mark all notifications as read for a user
app.patch('/api/notifications/read-all', async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) {
    return res.status(400).json({ msg: 'userEmail is required' });
  }
  try {
    await Notification.updateMany(
      { userEmail, isRead: false },
      { isRead: true }
    );
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ msg: 'Failed to update notifications' });
  }
});
// Delete a notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.json({ msg: 'Notification deleted' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ msg: 'Failed to delete notification' });
  }
});
// MODIFY YOUR EXISTING APPROVE PRODUCT ROUTE
app.put('/api/products/:id/approve', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    product.status = 'Approved';
    await product.save();
    // CREATE NOTIFICATION FOR SELLER
    await Notification.create({
      userEmail: product.store, // seller's email
      type: 'product_approved',
      title: 'Product Approved! ✅',
      message: `Your product "${product.name}" has been approved and is now visible in the marketplace.`,
      productId: product._id,
      productName: product.name
    });
    res.json({ msg: 'Product approved', product });
  } catch (err) {
    console.error('Error approving product:', err);
    res.status(500).json({ msg: 'Failed to approve product' });
  }
});
// MODIFY YOUR EXISTING REJECT PRODUCT ROUTE
app.put('/api/products/:id/reject', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    product.status = 'Rejected';
    await product.save();
    // CREATE NOTIFICATION FOR SELLER
    await Notification.create({
      userEmail: product.store, // seller's email
      type: 'product_rejected',
      title: 'Product Rejected ❌',
      message: `Your product "${product.name}" has been rejected. Please review and resubmit if needed.`,
      productId: product._id,
      productName: product.name
    });
    res.json({ msg: 'Product rejected', product });
  } catch (err) {
    console.error('Error rejecting product:', err);
    res.status(500).json({ msg: 'Failed to reject product' });
  }
});
// GET /api/unread-count?buyer=...&seller=...
app.get('/api/unread-count', async (req, res) => {
  const { buyer, seller } = req.query;
  // Query your DB for unread messages from seller to buyer
  const unreadCount = await Message.countDocuments({
    from: seller,
    to: buyer,
    read: false
  });
  res.json({ unreadCount });
});
// POST /api/messages/image - Add this route
app.post('/api/messages/image', upload.single('image'), async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ msg: 'Missing from or to email' });
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file provided' });
    }
    // --- MODIFIED: Determine the base URL dynamically ---
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Save image message to database
    const msg = new Message({
      from,
      to,
      // Store only the filename in the database
      imageUrl: req.file.filename,
      type: 'image',
      read: false
    });
    await msg.save();

    // Emit to socket
    const room = [from, to].sort().join('-');
    io.to(room).emit('receive-image', {
      _id: msg._id,
      from: msg.from,
      to: msg.to,
      // Construct the full URL dynamically when emitting
      imageUrl: `${baseUrl}/uploads/${req.file.filename}`,
      type: 'image',
      timestamp: msg.timestamp,
      read: false
    });

    // Send response with dynamically constructed URL
    res.json({
      success: true,
      // Construct the full URL dynamically for the response
      imageUrl: `${baseUrl}/uploads/${req.file.filename}`,
      message: msg
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ msg: 'Failed to upload image' });
  }
});
// --- NEW: Payment Method Routes ---
// GET: Fetch payment methods for a specific seller
app.get('/api/payment-methods/:storeEmail', async (req, res) => {
  try {
    const { storeEmail } = req.params;
    const methods = await PaymentMethod.findOne({ storeEmail });
    if (!methods) {
      // Return default empty structure if not found
      return res.json({
        gcash: { number: '', qrCode: null },
        paymaya: { number: '', qrCode: null },
        bank: { number: '', qrCode: null }
      });
    }
    res.json(methods);
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    res.status(500).json({ msg: 'Failed to fetch payment methods' });
  }
});
// POST/PUT: Update payment methods for a specific seller
app.post('/api/payment-methods/:storeEmail', paymentUpload.fields([
  { name: 'gcashQr', maxCount: 1 },
  { name: 'paymayaQr', maxCount: 1 },
  { name: 'bankQr', maxCount: 1 }
]), async (req, res) => {
  try {
    const { storeEmail } = req.params;
    const { gcashNumber, paymayaNumber, bankNumber } = req.body;
    // Prepare update object
    const updateData = {
      storeEmail,
      updatedAt: new Date()
    };
    // Handle GCash
    if (gcashNumber !== undefined) updateData['gcash.number'] = gcashNumber;
    if (req.files['gcashQr']) {
      updateData['gcash.qrCode'] = req.files['gcashQr'][0].filename;
    }
    // Handle PayMaya
    if (paymayaNumber !== undefined) updateData['paymaya.number'] = paymayaNumber;
    if (req.files['paymayaQr']) {
      updateData['paymaya.qrCode'] = req.files['paymayaQr'][0].filename;
    }
    // Handle Bank
    if (bankNumber !== undefined) updateData['bank.number'] = bankNumber;
    if (req.files['bankQr']) {
      updateData['bank.qrCode'] = req.files['bankQr'][0].filename;
    }
    // Upsert: update if exists, create if doesn't
    const updatedMethods = await PaymentMethod.findOneAndUpdate(
      { storeEmail },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, methods: updatedMethods });
  } catch (err) {
    console.error('Error updating payment methods:', err);
    res.status(500).json({ msg: 'Failed to update payment methods', error: err.message });
  }
});
// NEW: DELETE: Remove a specific payment method (number and QR code)
app.delete('/api/payment-methods/:storeEmail/:methodType', async (req, res) => {
  try {
    const { storeEmail, methodType } = req.params;
    console.log(`Attempting to delete ${methodType} for store: ${storeEmail}`); // Debug log
    // Validate method type
    if (!['gcash', 'paymaya', 'bank'].includes(methodType)) {
      console.error(`Invalid payment method type: ${methodType}`);
      return res.status(400).json({ msg: 'Invalid payment method type' });
    }
    // Prepare update object to clear the method using $unset
    const updateData = {
      $unset: { 
        [`${methodType}.number`]: "",
        [`${methodType}.qrCode`]: ""
      },
      updatedAt: new Date()
    };
    // Find and update the record
    let updatedMethods = await PaymentMethod.findOneAndUpdate(
      { storeEmail },
      updateData,
      { new: true, upsert: false } // Return the updated document, don't upsert here
    );

    if (!updatedMethods) {
      // If no record existed, return the default empty structure
      console.log(`No existing payment record found for ${storeEmail}, returning default.`);
      return res.json({ 
        success: true, 
        methods: {
          gcash: { number: '', qrCode: null },
          paymaya: { number: '', qrCode: null },
          bank: { number: '', qrCode: null }
        } 
      });
    }
    console.log(`Successfully deleted ${methodType} for ${storeEmail}. Updated methods:`, updatedMethods);
    res.json({ success: true, methods: updatedMethods });
  } catch (err) {
    console.error('Error deleting payment method:', err);
    res.status(500).json({ msg: 'Failed to delete payment method', error: err.message });
  }
});
// --- END NEW: Payment Method Routes ---
// ==========================================
// SELLER VERIFICATION ROUTES WITH NOTIFICATIONS
// ==========================================
// Approve seller
app.put('/admin/approve-seller/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }
    seller.isApproved = true;
    seller.rejected = false;
    await seller.save();
    // ✅ CREATE NOTIFICATION FOR SELLER
    const notification = await Notification.create({
      userEmail: seller.email,
      type: 'seller_approved',
      title: 'Seller Application Approved! 🎉',
      message: `Congratulations ${seller.name}! Your seller application has been approved. You can now start adding products to your store.`,
      isRead: false
    });
    // ✅ EMIT REAL-TIME NOTIFICATION
    io.emit('new-notification', {
      userEmail: seller.email,
      notification
    });
    console.log(`✅ Seller approved: ${seller.email}`);
    res.json({ msg: 'Seller approved', seller });
  } catch (err) {
    console.error('Error approving seller:', err);
    res.status(500).json({ msg: 'Failed to approve seller' });
  }
});
// Reject seller
app.put('/admin/reject-seller/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }
    seller.rejected = true;
    seller.isApproved = false;
    await seller.save();
    // ✅ CREATE NOTIFICATION FOR SELLER
    const notification = await Notification.create({
      userEmail: seller.email,
      type: 'seller_rejected',
      title: 'Seller Application Rejected ❌',
      message: `We're sorry ${seller.name}, but your seller application has been rejected. Please review your documents and try again with valid information.`,
      isRead: false
    });
    // ✅ EMIT REAL-TIME NOTIFICATION
    io.emit('new-notification', {
      userEmail: seller.email,
      notification
    });
    console.log(`❌ Seller rejected: ${seller.email}`);
    res.json({ msg: 'Seller rejected', seller });
  } catch (err) {
    console.error('Error rejecting seller:', err);
    res.status(500).json({ msg: 'Failed to reject seller' });
  }
});
// ✅ ALSO ADD NOTIFICATION WHEN SELLER SUBMITS VERIFICATION
app.post('/api/verification/upload', upload.fields([
  { name: 'frontId', maxCount: 1 },
  { name: 'backId', maxCount: 1 },
  { name: 'selfieId', maxCount: 1 }
]), async (req, res) => {
  try {
    const { sellerName, email } = req.body;
    // Access uploaded files
    const frontIdPath = req.files['frontId'][0].path;
    const backIdPath = req.files['backId'][0].path;
    const selfieIdPath = req.files['selfieId'][0].path;
    // Save to database
    const newVerification = new Seller({
      name: sellerName,
      email,
      frontIdPath: path.relative(__dirname, frontIdPath),
      backIdPath: path.relative(__dirname, backIdPath),
      selfieIdPath: path.relative(__dirname, selfieIdPath),
      isApproved: false,
      rejected: false,
      password: ''
    });
    await newVerification.save();
    // ✅ CREATE NOTIFICATION FOR SELLER (SUBMISSION CONFIRMATION)
    await Notification.create({
      userEmail: email,
      type: 'seller_submitted',
      title: 'Application Submitted Successfully ✅',
      message: `Thank you ${sellerName}! Your seller verification has been submitted and is currently under review. We'll notify you once it's processed.`,
      isRead: false
    });
    // ✅ EMIT REAL-TIME NOTIFICATION
    io.emit('new-notification', {
      userEmail: email,
      notification: {
        userEmail: email,
        type: 'seller_submitted',
        title: 'Application Submitted Successfully ✅',
        message: `Thank you ${sellerName}! Your seller verification has been submitted and is currently under review.`,
        createdAt: new Date()
      }
    });
    res.status(201).json({ message: 'Verification files uploaded and seller info saved' });
  } catch (error) {
    console.error('Verification upload error:', error);
    res.status(500).json({ message: 'Verification upload failed' });
  }
});
// GET /api/seller/inbox?sellerEmail=...
app.get('/api/seller/inbox', async (req, res) => {
  const { sellerEmail } = req.query;
  if (!sellerEmail) {
    return res.status(400).json({ msg: 'sellerEmail is required' });
  }
  try {
    // Find all conversations where seller is involved
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: sellerEmail },
            { to: sellerEmail }
          ]
        }
      },
      {
        $addFields: {
          // Identify the other party (buyer)
          otherParty: {
            $cond: {
              if: { $eq: ["$from", sellerEmail] },
              then: "$to",
              else: "$from"
            }
          }
        }
      },
      {
        $group: {
          _id: "$otherParty",
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$to", sellerEmail] },
                    { $eq: ["$read", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "email",
          as: "buyerInfo"
        }
      },
      {
        $addFields: {
          buyerName: { $arrayElemAt: ["$buyerInfo.name", 0] }
        }
      },
      { $sort: { "lastMessage.timestamp": -1 } }
    ]);

    const result = conversations.map(conv => ({
      buyerEmail: conv._id,
      buyerName: conv.buyerName || conv._id.split('@')[0],
      lastMessage: conv.lastMessage.type === 'image' ? '🖼️ Image' : conv.lastMessage.text,
      lastMessageFrom: conv.lastMessage.from,
      timestamp: conv.lastMessage.timestamp,
      unreadCount: conv.unreadCount
    }));

    res.json({ conversations: result });
  } catch (err) {
    console.error('Error fetching seller inbox:', err);
    res.status(500).json({ msg: 'Failed to load inbox' });
  }
});
// PATCH /api/products/:id/restock
app.patch('/api/products/:id/restock', async (req, res) => {
  try {
    const { change } = req.body; // e.g., +5 or -3
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    const newQuantity = product.quantity + change;
    if (newQuantity < 0) {
      return res.status(400).json({ msg: 'Quantity cannot be negative' });
    }
    product.quantity = newQuantity;
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error('Restock error:', err);
    res.status(500).json({ msg: 'Failed to update quantity' });
  }
});
// PATCH /api/products/:id/toggle-visibility
app.patch('/api/products/:id/toggle-visibility', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    // Add hidden field if not exists
    product.hidden = !product.hidden;
    await product.save();
    // Emit event to refresh marketplace
    io.emit('inventoryUpdate');
    res.json({ success: true, hidden: product.hidden });
  } catch (err) {
    console.error('Toggle visibility error:', err);
    res.status(500).json({ msg: 'Failed to toggle visibility' });
  }
});
// GET /api/buyer/inbox?buyerEmail=...
app.get('/api/buyer/inbox', async (req, res) => {
  const { buyerEmail } = req.query;
  if (!buyerEmail) {
    return res.status(400).json({ msg: 'buyerEmail is required' });
  }
  try {
    // Find all conversations where buyer is involved (sent OR received messages)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: buyerEmail },
            { to: buyerEmail }
          ]
        }
      },
      {
        $addFields: {
          // Identify the other party (seller)
          otherParty: {
            $cond: {
              if: { $eq: ["$from", buyerEmail] },
              then: "$to",
              else: "$from"
            }
          }
        }
      },
      {
        $group: {
          _id: "$otherParty",
          lastMessage: { $last: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$to", buyerEmail] },
                    { $eq: ["$read", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "sellers",
          localField: "_id",
          foreignField: "email",
          as: "sellerInfo"
        }
      },
      {
        $addFields: {
          sellerName: { $arrayElemAt: ["$sellerInfo.name", 0] }
        }
      },
      { $sort: { "lastMessage.timestamp": -1 } }
    ]);

    const result = conversations.map(conv => ({
      sellerEmail: conv._id,
      sellerName: conv.sellerName || conv._id.split('@')[0],
      lastMessage: conv.lastMessage.type === 'image' ? '🖼️ Image' : conv.lastMessage.text,
      lastMessageFrom: conv.lastMessage.from,
      timestamp: conv.lastMessage.timestamp,
      unreadCount: conv.unreadCount
    }));

    res.json({ conversations: result });
  } catch (err) {
    console.error('Error fetching buyer inbox:', err);
    res.status(500).json({ msg: 'Failed to load inbox' });
  }
});
// POST /api/messages/mark-read
app.post('/api/messages/mark-read', async (req, res) => {
  const { buyerEmail, sellerEmail } = req.body;
  if (!buyerEmail || !sellerEmail) {
    return res.status(400).json({ msg: 'Both emails required' });
  }
  try {
    // Mark all messages in this conversation as read
    // This works for both directions (buyer reading seller's messages AND seller reading buyer's messages)
    await Message.updateMany(
      {
        $or: [
          { from: buyerEmail, to: sellerEmail },
          { from: sellerEmail, to: buyerEmail }
        ],
        read: false
      },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ msg: 'Failed to mark as read' });
  }
});
app.delete('/api/conversations/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const user1Email = user1.toLowerCase().trim();
  const user2Email = user2.toLowerCase().trim();
  if (!user1Email || !user2Email) {
    return res.status(400).json({ msg: 'Both user emails are required' });
  }
  try {
    // Delete messages where user1 and user2 are involved (both directions)
    await Message.deleteMany({
      $or: [
        { from: user1Email, to: user2Email },
        { from: user2Email, to: user1Email }
      ]
    });
    // Optionally, emit a socket event to notify clients if they are in the deleted room
    // This is optional and depends on your frontend logic
    // const room = [user1Email, user2Email].sort().join('-');
    // io.to(room).emit('conversation-deleted', { user1: user1Email, user2: user2Email });
    res.json({ success: true, msg: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ msg: 'Failed to delete conversation' });
  }
});
// --- USER ROUTES ---
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received signup request:", { name, email });
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'All fields are required.' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      verificationCodeExpiry,
      isVerified: false
    });
    await newUser.save();
    const mailOptions = {
      to: email,
      from: '"PCA" <pcaphilippinecoconutauthority@gmail.com>',
      subject: 'Verify Your Email - PCA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">Welcome to PCA!</h2>
          <p>Use the following code to verify your email:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${verificationCode}
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">If you didn't sign up, please ignore this email.</p>
        </div>
      `
    };
    console.log("Sending email to:", email);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
        return res.status(500).json({ msg: 'Failed to send verification email' });
      }
      console.log('Verification email sent:', info.response);
      return res.json({ redirect: true, email }); // include email for frontend redirect
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ msg: 'User creation failed' });
  }
});
app.post('/verify-code', async (req, res) => {
  console.log('Request body:', req.body);
  const { email, code } = req.body;
  if (!email || !code) {
    console.log('Missing email or code:', { email, code });
    return res.status(400).json({ msg: 'Missing email or code.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (!user.verificationCode) {
      return res.status(400).json({ msg: 'Verification code not found or expired.' });
    }
    if (Date.now() > user.verificationCodeExpiry) {
      return res.status(400).json({ msg: 'Verification code expired' });
    }
    if (user.verificationCode.trim() !== code.trim()) {
      return res.status(400).json({ msg: 'Incorrect code.' });
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('Verify code error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});
// Follow
app.post('/api/follow', async (req, res) => {
  const { followerEmail, sellerEmail } = req.body;
  if (!followerEmail || !sellerEmail) {
    return res.status(400).json({ msg: 'Both emails required' });
  }
  if (followerEmail === sellerEmail) {
    return res.status(400).json({ msg: 'Cannot follow yourself' });
  }
  try {
    const follow = new Follower({ followerEmail, sellerEmail });
    await follow.save();
    res.status(201).json({ msg: 'Followed' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ msg: 'Already following' });
    res.status(500).json({ msg: 'Server error' });
  }
});
// Unfollow
app.post('/api/unfollow', async (req, res) => {
  const { followerEmail, sellerEmail } = req.body;
  try {
    await Follower.findOneAndDelete({ followerEmail, sellerEmail });
    res.json({ msg: 'Unfollowed' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
// Check if following
app.get('/api/is-following', async (req, res) => {
  const { follower, seller } = req.query;
  if (!follower || !seller) return res.status(400).json({ msg: 'Query params required' });
  const exists = await Follower.findOne({ followerEmail: follower, sellerEmail: seller });
  res.json({ isFollowing: !!exists });
});
// Get followers
app.get('/api/followers', async (req, res) => {
  const { seller } = req.query;
  if (!seller) return res.status(400).json({ msg: 'seller query required' });
  const followers = await Follower.find({ sellerEmail: seller }).select('followerEmail -_id');
  const emails = followers.map(f => f.followerEmail);
  const users = await User.find({ email: { $in: emails } }, 'name email');
  const map = {};
  users.forEach(u => map[u.email] = u.name);
  const enriched = followers.map(f => ({
    email: f.followerEmail,
    name: map[f.followerEmail] || f.followerEmail.split('@')[0]
  }));
  res.json({ followers: enriched });
});
// Get chat
app.get('/api/chat', async (req, res) => {
  const { user1, user2 } = req.query;
  if (!user1 || !user2) return res.status(400).json({ msg: 'Both users required' });
  const messages = await Message.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 }
    ]
  }).sort({ timestamp: 1 });
  res.json({ messages });
});
// Send message
app.post('/api/messages', async (req, res) => {
  const { from, to, text } = req.body;
  if (!from || !to || !text) return res.status(400).json({ msg: 'Missing fields' });
  const msg = new Message({ from, to, text });
  await msg.save();
  res.status(201).json(msg);
});
app.post('/resend-code', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: 'Missing email.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }
    // Generate a new 6-digit verification code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = newCode;
    user.verificationCodeExpiry = Date.now() + 5 * 60 * 1000; // valid for 5 minutes
    await user.save();
    // Prepare and send email
    const mailOptions = {
      to: email,
      from: '"PCA" <pcaphilippinecoconutauthority@gmail.com>',
      subject: 'New Verification Code - PCA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">Resend Verification Code</h2>
          <p>Here’s your new verification code:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${newCode}
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This code will expire in 5 minutes.
          </p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, msg: 'New verification code sent to your email.' });
  } catch (err) {
    console.error('Resend verification code error:', err);
    res.status(500).json({ msg: 'Failed to resend verification code.' });
  }
});
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });
    if (!user.isVerified) {
      return res.status(403).json({ msg: 'Please verify your email before logging in.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Incorrect password' });
    res.json({ msg: 'Login successful', user: user.toObject() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Login failed' });
  }
});
// Add after your existing login route
// Request password reset
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ msg: 'If an account exists, a reset code will be sent to your email.' });
    }
    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetCode = resetCode;
    user.resetCodeExpiry = resetCodeExpiry;
    await user.save();
    // Send email
    const mailOptions = {
      to: email,
      from: '"PCA" <pcaphilippinecoconutauthority@gmail.com>',
      subject: 'Password Reset Code - PCA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>You requested to reset your password. Use the following code:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${resetCode}
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This code will expire in 10 minutes.
          </p>
          <p style="font-size: 0.9em; color: #777;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    res.json({ msg: 'If an account exists, a reset code will be sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ msg: 'Failed to process request' });
  }
});
// Verify reset code
app.post('/verify-reset-code', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ msg: 'Email and code are required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetCode) {
      return res.status(400).json({ msg: 'Invalid or expired reset code' });
    }
    if (Date.now() > user.resetCodeExpiry) {
      return res.status(400).json({ msg: 'Reset code has expired' });
    }
    if (user.resetCode.trim() !== code.trim()) {
      return res.status(400).json({ msg: 'Incorrect reset code' });
    }
    res.json({ success: true, msg: 'Code verified successfully' });
  } catch (err) {
    console.error('Verify reset code error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
// Reset password
app.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ msg: 'All fields are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetCode) {
      return res.status(400).json({ msg: 'Invalid reset request' });
    }
    if (Date.now() > user.resetCodeExpiry) {
      return res.status(400).json({ msg: 'Reset code has expired' });
    }
    if (user.resetCode.trim() !== code.trim()) {
      return res.status(400).json({ msg: 'Incorrect reset code' });
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    await user.save();
    res.json({ success: true, msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ msg: 'Failed to reset password' });
  }
});
// Resend reset code
app.post('/resend-reset-code', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: 'If an account exists, a new code will be sent.' });
    }
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = newCode;
    user.resetCodeExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    const mailOptions = {
      to: email,
      from: '"PCA" <pcaphilippinecoconutauthority@gmail.com>',
      subject: 'New Password Reset Code - PCA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2c3e50;">New Password Reset Code</h2>
          <p>Here's your new password reset code:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; display: inline-block;">
            ${newCode}
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This code will expire in 10 minutes.
          </p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    res.json({ success: true, msg: 'New reset code sent to your email.' });
  } catch (err) {
    console.error('Resend reset code error:', err);
    res.status(500).json({ msg: 'Failed to resend code' });
  }
});
// --- REGISTRATION FORM ROUTES (from old server) ---
const registrationUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    mime && ext ? cb(null, true) : cb(new Error('Only images and PDFs are allowed'));
  }
}).fields([
  { name: 'notarizedpca', maxCount: 1 },
  { name: 'dti', maxCount: 1 },
  { name: 'municipalpermitlicense', maxCount: 1 }
]);
app.post('/register-application', registrationUpload, async (req, res) => {
  try {
    const formData = req.body;
    if (req.files['notarizedpca']) {
      formData.notarizedpca = req.files['notarizedpca'][0].filename;
    }
    if (req.files['dti']) {
      formData.dti = req.files['dti'][0].filename;
    }
    if (req.files['municipalpermitlicense']) {
      formData.municipalpermitlicense = req.files['municipalpermitlicense'][0].filename;
    }
    // Process coordinates from the form data
    let coordinates = null;
    if (formData.coordinates) {
      try {
        const coordsArray = JSON.parse(formData.coordinates);
        if (Array.isArray(coordsArray) && coordsArray.length === 2) {
          coordinates = {
            type: 'Point',
            coordinates: [parseFloat(coordsArray[0]), parseFloat(coordsArray[1])] // [lng, lat]
          };
        }
      } catch (e) {
        console.error('Error parsing coordinates:', e);
        // Optionally return an error if coordinates are malformed
        // return res.status(400).json({ msg: 'Invalid coordinates format' });
      }
    }
    // Create new registration object
    const newRegistration = new Registration({
      ...formData,
      coordinates: coordinates, // Add the processed coordinates
      landArea: formData.landArea ? parseFloat(formData.landArea) : null // Add land area as a number
    });
    await newRegistration.save();
    res.status(201).json({
      msg: 'Registration form submitted successfully!',
      data: newRegistration
    });
  } catch (error) {
    console.error('Registration submission error:', error);
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        msg: `This ${field} already exists. Please use a unique value.`
      });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    res.status(500).json({ msg: 'Form submission failed' });
  }
});
app.patch('/api/registrations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    // Fetch the full registration data to pass to the email function
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated document
    );
    if (!registration) return res.status(404).json({ msg: 'Registration not found' });
    // Send email notification - now passing the full registration object
    if (status === 'accepted' || status === 'rejected') {
      await sendNotificationEmail(
        registration.companyemailaddress,
        registration.registeredbusinessname,
        status,
        registration.applicationType,
        registration // Pass the full registration object for certificate generation
      );
    }
    res.json({ msg: `Registration ${status}`, registration });
  } catch (err) {
    console.error('Error updating registration status:', err);
    res.status(500).json({ msg: 'Failed to update status' });
  }
});
app.get('/api/registrations/count-by-type', async (req, res) => {
  try {
    const farmers = await Registration.countDocuments({ farmersormanufacturers: 'Farmer' });
    const manufacturers = await Registration.countDocuments({ farmersormanufacturers: 'Manufacturer' });
    res.json({ farmers, manufacturers });
  } catch (err) {
    console.error('Error counting registrations:', err);
    res.status(500).json({ msg: 'Failed to count registrations by type' });
  }
});
app.get('/api/registrations/summary', async (req, res) => {
  try {
    const registrations = await Registration.find({},
      'applicationType previousPcaRegistrationNumber validityperiod dateRegistration status registeredbusinessname province municipality barangay coordinates landArea' // Include landArea in the summary
    );
    res.json(registrations);
  } catch (err) {
    console.error('Error fetching registration summary:', err);
    res.status(500).json({ msg: 'Error fetching registration summary' });
  }
});
app.get('/api/registrations/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ msg: 'Registration not found' });
    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration by ID:', error);
    res.status(500).json({ msg: 'Error fetching registration' });
  }
});
// --- PERMIT ROUTES (from old server) ---
const permitUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    mime && ext ? cb(null, true) : cb(new Error('Only images and PDFs are allowed'));
  }
}).fields([
  { name: 'supportingDoc', maxCount: 1 },
  { name: 'idCopy', maxCount: 1 }
]);
app.post('/apply-permit', permitUpload, async (req, res) => {
  try {
    const { permitType } = req.body;
    // Check for required files
    if (!req.files?.supportingDoc || !req.files?.idCopy) {
      return res.status(400).json({ msg: 'Supporting document and ID copy are required.' });
    }
    // --- TRANSPORT PERMIT ---
    if (permitType === 'transport') {
      const {
        email,
        applicantName,
        registrationCertificateNo,
        addressOfApplicant,
        transportPermitNo,
        registrationCertificateDate,
        dateIssued,
        ptcNo,
        pcaConsigneeName,
        pcaConsigneeDestination,
        vehicle,
        registeredPlateNumber,
        authorizedDriver,
        municipalityOrigin,
        brgyOrigin,
        destination,
        volume,
        effectivityStart,
        effectivityEnd,
        officialReceiptNo
      } = req.body;
      const newTransportPermit = new TransportPermit({
        email,
        applicantName,
        registrationCertificateNo,
        province: 'Quezon', // Assuming it's for Quezon, you can make this dynamic
        addressOfApplicant,
        transportPermitNo,
        registrationCertificateDate: new Date(registrationCertificateDate),
        dateIssued: new Date(dateIssued),
        ptcNo: ptcNo || undefined,
        pcaConsigneeName,
        pcaConsigneeDestination,
        vehicle,
        registeredPlateNumber,
        authorizedDriver,
        municipalityOrigin,
        brgyOrigin,
        destination,
        volume: parseFloat(volume),
        effectivityStart: new Date(effectivityStart),
        effectivityEnd: new Date(effectivityEnd),
        officialReceiptNo,
        supportingDoc: req.files.supportingDoc[0].filename,
        idCopy: req.files.idCopy[0].filename,
        permitType: 'transport'
      });
      await newTransportPermit.save();
      return res.status(201).json({ msg: 'Transport permit application submitted successfully!' });
    }
    // --- CUT PERMIT ---
    else if (permitType === 'cut') {
      const {
        email,
        nameOfAgriculturist,
        cityOrMunicipality,
        brgy,
        applicationNumber,
        dateOfFiling,
        permitToCutNo,
        tctNo,
        tdnNo,
        dateIssued,
        issuedTo,
        applicantCityOrMunicipality,
        numberOfTreesApplied,
        numberOfApprovedTrees,
        numberOfSeedlingsPlanted,
        numberOfSeedlingReplacements,
        groundCutting,
        conversionOrderNo,
        landConversionDate,
        estimatedVolumePerTree,
        officialReceiptNumber,
        receiptDate
      } = req.body;
      const newCutPermit = new CutPermit({
        email,
        nameOfAgriculturist,
        cityOrMunicipality,
        brgy,
        applicationNumber,
        dateOfFiling: new Date(dateOfFiling),
        permitToCutNo,
        tctNo: tctNo || undefined,
        tdnNo: tdnNo || undefined,
        dateIssued: new Date(dateIssued),
        issuedTo,
        applicantCityOrMunicipality,
        numberOfTreesApplied: parseInt(numberOfTreesApplied, 10),
        numberOfApprovedTrees: numberOfApprovedTrees ? parseInt(numberOfApprovedTrees, 10) : undefined,
        numberOfSeedlingsPlanted: numberOfSeedlingsPlanted ? parseInt(numberOfSeedlingsPlanted, 10) : undefined,
        numberOfSeedlingReplacements: numberOfSeedlingReplacements ? parseInt(numberOfSeedlingReplacements, 10) : undefined,
        groundCutting,
        conversionOrderNo: conversionOrderNo || undefined,
        landConversionDate: landConversionDate || undefined,
        estimatedVolumePerTree: estimatedVolumePerTree ? parseFloat(estimatedVolumePerTree) : undefined,
        officialReceiptNumber,
        receiptDate: new Date(receiptDate),
        supportingDoc: req.files.supportingDoc[0].filename,
        idCopy: req.files.idCopy[0].filename,
        permitType: 'cut'
      });
      await newCutPermit.save();
      return res.status(201).json({ msg: 'Cut permit application submitted successfully!' });
    }
    // --- INVALID PERMIT TYPE ---
    else {
      return res.status(400).json({ msg: 'Invalid permit type. Must be "cut" or "transport".' });
    }
  } catch (error) {
    console.error('Permit submission error:', error);
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        msg: `This ${field} already exists. Please use a unique value.`
      });
    }
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ msg: messages.join(', ') });
    }
    res.status(500).json({ msg: 'Failed to submit permit application. Please try again.' });
  }
});
// Get all permits (both Cut and Transport)
app.get('/api/permits', async (req, res) => {
  try {
    const cutPermits = await CutPermit.find().lean();
    const transportPermits = await TransportPermit.find().lean();
    // Combine both arrays
    const allPermits = [...cutPermits, ...transportPermits];
    res.json(allPermits);
  } catch (error) {
    console.error('Error fetching permits:', error);
    res.status(500).json({ msg: 'Failed to fetch permits' });
  }
});
// Get single permit by ID and type
app.get('/api/permits/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let permit;
    if (type === 'cut') {
      permit = await CutPermit.findById(id);
    } else if (type === 'transport') {
      permit = await TransportPermit.findById(id);
    } else {
      return res.status(400).json({ msg: 'Invalid permit type' });
    }
    if (!permit) return res.status(404).json({ msg: 'Permit not found' });
    res.json(permit);
  } catch (error) {
    console.error('Error fetching permit:', error);
    res.status(500).json({ msg: 'Error fetching permit' });
  }
});
// Update permit status (Approve/Reject)
app.patch('/api/permits/:type/:id/status', async (req, res) => {
  try {
    const { type, id } = req.params;
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    let permit;
    if (type === 'cut') {
      permit = await CutPermit.findByIdAndUpdate(id, { status }, { new: true });
    } else if (type === 'transport') {
      permit = await TransportPermit.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      return res.status(400).json({ msg: 'Invalid permit type' });
    }
    if (!permit) return res.status(404).json({ msg: 'Permit not found' });
    res.json({ msg: `Permit ${status}`, permit });
  } catch (error) {
    console.error('Error updating permit status:', error);
    res.status(500).json({ msg: 'Failed to update permit status' });
  }
});
// Delete permit
app.delete('/api/permits/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let permit;
    if (type === 'cut') {
      permit = await CutPermit.findByIdAndDelete(id);
    } else if (type === 'transport') {
      permit = await TransportPermit.findByIdAndDelete(id);
    } else {
      return res.status(400).json({ msg: 'Invalid permit type' });
    }
    if (!permit) return res.status(404).json({ msg: 'Permit not found' });
    // Delete uploaded files if they exist
    const filesToDelete = [permit.supportingDoc, permit.idCopy].filter(Boolean);
    filesToDelete.forEach(filename => {
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    res.json({ msg: 'Permit deleted successfully' });
  } catch (error) {
    console.error('Error deleting permit:', error);
    res.status(500).json({ msg: 'Failed to delete permit' });
  }
});
// --- SELLER ROUTES ---
app.post('/seller/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) return res.status(400).json({ msg: 'Seller already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new Seller({ name, email, password: hashedPassword });
    await newSeller.save();
    res.json({ msg: 'Seller registered, waiting for admin approval' });
  } catch (err) {
    console.error('Seller signup error:', err);
    res.status(500).json({ msg: 'Seller registration failed' });
  }
});
// NEWW CODES
app.post('/api/verification/upload', upload.fields([
  { name: 'frontId', maxCount: 1 },
  { name: 'backId', maxCount: 1 },
  { name: 'selfieId', maxCount: 1 }
]), async (req, res) => {
  try {
    const { sellerName, email } = req.body;
    // Access uploaded files
    const frontIdPath = req.files['frontId'][0].path;
    const backIdPath = req.files['backId'][0].path;
    const selfieIdPath = req.files['selfieId'][0].path;
    // Save to database or process further
    const newVerification = new Seller({
      name: sellerName,
      email,
      frontIdPath: path.relative(__dirname, frontIdPath),
      backIdPath: path.relative(__dirname, backIdPath),
      selfieIdPath: path.relative(__dirname, selfieIdPath),
      isApproved: false,
      rejected: false,
      password: ''
    });
    await newVerification.save();
    res.status(201).json({ message: 'Verification files uploaded and seller info saved' });
  } catch (error) {
    console.error('Verification upload error:', error);
    res.status(500).json({ message: 'Verification upload failed' });
  }
});
// --- MODIFIED: Use dynamic URL for verification documents ---
app.get('/api/verification', async (req, res) => {
  try {
    const sellers = await Seller.find({
      frontIdPath: { $exists: true, $ne: null },
      backIdPath: { $exists: true, $ne: null },
      selfieIdPath: { $exists: true, $ne: null }
    });

    // --- MODIFIED: Determine the base URL dynamically ---
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const response = sellers.map(seller => ({
      _id: seller._id,
      sellerName: seller.name,
      email: seller.email,
      submittedAt: seller.updatedAt || seller.createdAt,
      status: seller.isApproved ? 'Approved' : (seller.rejected ? 'Rejected' : 'Pending'),
      // Construct URLs dynamically
      frontIdUrl: `${baseUrl}/uploads/seller-verification/${path.basename(seller.frontIdPath)}`,
      backIdUrl: `${baseUrl}/uploads/seller-verification/${path.basename(seller.backIdPath)}`,
      selfieIdUrl: `${baseUrl}/uploads/seller-verification/${path.basename(seller.selfieIdPath)}`
    }));
    res.json(response);
  } catch (error) {
    console.error('Fetch verification error:', error);
    res.status(500).json({ message: 'Failed to fetch verifications' });
  }
});
// GET /api/seller?email=some@email.com
app.get('/api/seller', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ msg: 'Email query parameter is required' });
  }
  try {
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }
    // Return full seller status info
    res.json({
      exists: true,
      name: seller.name,
      email: seller.email,
      isApproved: seller.isApproved || false,
      rejected: seller.rejected || false,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
    });
  } catch (err) {
    console.error('Error fetching seller:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
app.get('/admin/pending-sellers', async (req, res) => {
  try {
    const pendingSellers = await Seller.find({ isApproved: false, rejected: { $ne: true } });
    res.json(pendingSellers);
  } catch (err) {
    console.error('Error fetching pending sellers:', err);
    res.status(500).json({ msg: 'Failed to get pending sellers' });
  }
});
app.put('/admin/approve-seller/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    const seller = await Seller.findById(sellerId);
    if (!seller) return res.status(404).json({ msg: 'Seller not found' });
    seller.isApproved = true;
    seller.rejected = false;
    await seller.save();
    res.json({ msg: 'Seller approved', seller });
  } catch (err) {
    console.error('Error approving seller:', err);
    res.status(500).json({ msg: 'Failed to approve seller' });
  }
});
app.put('/admin/reject-seller/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ msg: 'Seller not found' });
    seller.rejected = true;
    seller.isApproved = false;
    await seller.save();
    res.json({ msg: 'Seller rejected', seller });
  } catch (err) {
    console.error('Error rejecting seller:', err);
    res.status(500).json({ msg: 'Failed to reject seller' });
  }
});
app.delete('/admin/delete-verification/:id', async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    if (!seller) return res.status(404).json({ msg: 'Seller not found' });
    if (seller.verificationFilePath && fs.existsSync(path.join(__dirname, seller.verificationFilePath))) {
      fs.unlinkSync(path.join(__dirname, seller.verificationFilePath));
    }
    await Seller.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Seller verification deleted' });
  } catch (err) {
    console.error('Error deleting verification:', err);
    res.status(500).json({ msg: 'Failed to delete verification' });
  }
});
// --- CART ROUTES ---
app.get('/api/cart', async (req, res) => {
  try {
    const { userEmail } = req.query;
    if (!userEmail) {
      return res.status(400).json({ error: 'Missing userEmail in query' });
    }
    const cartItems = await CartItem.find({ userEmail });
    return res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.params.userId });
    res.json(cartItems);
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({ msg: 'Failed to fetch cart' });
  }
});
app.delete('/api/cart', async (req, res) => {
  const { userId, productName, selectedSize } = req.body;
  try {
    await CartItem.deleteOne({ userEmail: userId, name: productName, selectedSize });
    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error('Delete cart item error:', err);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});
// --- PRODUCT ROUTES ---
// New Code
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, description, store, quantity, sizes } = req.body;
    const parsedSizes = JSON.parse(sizes); // sizes should be a JSON object
    const newProduct = new Product({
      name,
      description,
      store,
      quantity: parseInt(quantity),
      image: req.file ? req.file.filename : null,
      sizes: parsedSizes,
      status: 'Pending' // important for verification
    });
    await newProduct.save();
    res.status(201).json({ msg: 'Product added and pending verification', product: newProduct });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ msg: 'Failed to add product' });
  }
});
// NEWWW
app.get('/api/products', async (req, res) => {
  try {
    const { store } = req.query;
    let query = { status: 'Approved' }; // Only show approved products
    if (store) {
      query.store = store;
    }
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ msg: 'Failed to fetch products' });
  }
});
// Get products pending verification (for ProductVerification component)
app.get('/api/products/pending-verification', async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'Pending' });
    res.json(pendingProducts);
  } catch (err) {
    console.error('Error fetching pending products:', err);
    res.status(500).json({ msg: 'Failed to get pending products' });
  }
});
// Get all products for a specific seller (including pending ones)
app.get('/api/products/seller/:email', async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.email });
    res.json(products);
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ msg: 'Failed to fetch products' });
  }
});
// Approve a product
app.put('/api/products/:id/approve', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    product.status = 'Approved';
    await product.save();
    res.json({ msg: 'Product approved', product });
  } catch (err) {
    console.error('Error approving product:', err);
    res.status(500).json({ msg: 'Failed to approve product' });
  }
});
// Reject a product
app.put('/api/products/:id/reject', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    product.status = 'Rejected';
    await product.save();
    res.json({ msg: 'Product rejected', product });
  } catch (err) {
    console.error('Error rejecting product:', err);
    res.status(500).json({ msg: 'Failed to reject product' });
  }
});
// NEWWW
app.put('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    if (!updatedProduct) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product updated', product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ msg: 'Failed to update product' });
  }
});
// Get all products pending verification
app.get('/admin/pending-products', async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'Pending' });
    res.json(pendingProducts);
  } catch (err) {
    console.error('Error fetching pending products:', err);
    res.status(500).json({ msg: 'Failed to get pending products' });
  }
});
// Approve a product
app.put('/admin/approve-product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    product.status = 'Approved';
    await product.save();
    res.json({ msg: 'Product approved', product });
  } catch (err) {
    console.error('Error approving product:', err);
    res.status(500).json({ msg: 'Failed to approve product' });
  }
});
app.put('/admin/reject-product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    product.status = 'Rejected';
    await product.save();
    res.json({ msg: 'Product rejected', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to reject product' });
  }
});
// New Code
app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ msg: 'Failed to delete product' });
  }
});
// Get ALL products with all statuses (for admin dashboard)
app.get('/api/products/all-status', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Error fetching all products:', err);
    res.status(500).json({ msg: 'Failed to fetch products' });
  }
});
// POST /api/purchases/close-deal
// ✅ CORRECTED /api/purchases/close-deal (ONLY ONE INSTANCE)
app.post('/api/purchases/close-deal', async (req, res) => {
  const { storeEmail, buyerEmail, products, paymentData } = req.body;
  if (!storeEmail || !buyerEmail || !Array.isArray(products)) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }
  try {
    for (const item of products) {
      const { name, selectedSize, quantity, price } = item;
      const product = await Product.findOne({ name, store: storeEmail });
      if (!product) {
        console.warn(`Product "${name}" not found`);
        continue;
      }
      if (product.quantity < quantity) {
        return res.status(400).json({ msg: `Not enough stock for "${name}"` });
      }
      // Update product stock
      product.quantity -= quantity;
      product.sold = (product.sold || 0) + quantity;
      // Initialize buyers array
      if (!product.buyers) product.buyers = [];
      // Check if buyer already exists
      const existingBuyerIndex = product.buyers.findIndex(b => b.buyerEmail === buyerEmail);
      if (existingBuyerIndex >= 0) {
        // Update existing buyer
        product.buyers[existingBuyerIndex].quantityBought += quantity;
        product.buyers[existingBuyerIndex].totalSpent += price * quantity;
        product.buyers[existingBuyerIndex].lastPurchase = new Date();
        // ✅ Preserve or update selectedSize
        product.buyers[existingBuyerIndex].selectedSize = selectedSize;
      } else {
        // Add new buyer WITH selectedSize
        product.buyers.push({
          buyerEmail,
          buyerName: buyerEmail.split('@')[0],
          quantityBought: quantity,
          totalSpent: price * quantity,
          purchaseDate: new Date(),
          lastPurchase: new Date(),
          paymentMethod: paymentData?.method || 'N/A',
          selectedSize: selectedSize // ✅ THIS IS CRITICAL
        });
      }
      await product.save();
    }
    res.json({ success: true, msg: 'Deal(s) closed successfully!' });
  } catch (err) {
    console.error('Close deal error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});
// --- MISC ROUTES ---
app.get('/api/users/count', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    res.json({ total: totalUsers });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ msg: 'Failed to get user count' });
  }
});
//  STEP 4: START THE HTTP SERVER (NOT app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});   
