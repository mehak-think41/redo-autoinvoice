const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { forward } = require('@ngrok/ngrok');

const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
connectDB();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const docRoutes = require('./routes/docRoutes')
const errorHandler = require('./middleware/errorHandler')

const app = express();

app.use(express.json());
app.use(cookieParser()); // Add cookie parser middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true // Allow cookies to be sent with requests
}));

const GoogleToken = require('./models/GoogleToken');
setInterval(async () => {
  await GoogleToken.cleanupExpiredTokens();
  console.log("✅ Cleaned up expired Google tokens.");
}, 60 * 60 * 1000); // Every hour

app.use('/h', (req, res) => {
  res.json({ status: true })
})

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/doc', docRoutes)

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);

  try {
    const listener = await forward({
      addr: PORT,
      authtoken_from_env: true,
      domain: process.env.NGROK_DOMAIN,
    });
    console.log(`🌍 Ngrok tunnel established at: ${listener.url()}`);

  } catch (error) {
    console.error("❌ Failed to establish ngrok tunnel:", error);
  }
});
