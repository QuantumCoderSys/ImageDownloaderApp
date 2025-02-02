require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Razorpay instance with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,  // Your Razorpay Key ID from .env
  key_secret: process.env.RAZORPAY_KEY_SECRET,  // Your Razorpay Secret Key from .env
});

// Endpoint to create order
app.post('/create-order', async (req, res) => {
  console.log('Received request to create order:', req.body);  // Log request data

  // Validate amount field
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    console.error('Invalid amount provided!');
    return res.status(400).json({ error: 'Amount is required and must be greater than zero' });
  }

  try {
    const options = {
      amount: amount * 100,  // Convert to paise (Razorpay requires amount in paise)
      currency: 'INR',
      receipt: `receipt_${Math.random()}`,  // Unique receipt number
      payment_capture: 1,  // Auto capture
    };

    console.log('Creating Razorpay order with options:', options);  // Log order options

    // Create Razorpay order
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);  // Log order creation success
    res.json(order);  // Send back the order details
  } catch (error) {
    console.error('Error creating order:', error.message);  // Log error message
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});