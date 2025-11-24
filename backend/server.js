const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
// const disputeRoutes = require('./routes/disputeRoutes'); // (Placeholder for later)

// --- Register Routes ---
app.use('/api/auth', authRoutes);         // Endpoints: /api/auth/login, etc.
app.use('/api/items/lost', lostItemRoutes);   // Endpoints: /api/items/lost
app.use('/api/items/found', foundItemRoutes); // Endpoints: /api/items/found
app.use('/api/dashboard', dashboardRoutes);   // Endpoints: /api/dashboard/stats

// Root Test
app.get('/', (req, res) => {
  res.send('TigerTrack Backend API is Running');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});