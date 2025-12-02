const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const itemRoutes = require('./routes/itemRoutes'); // <--- NEW IMPORT

// --- Register Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/lost', lostItemRoutes);
app.use('/api/found', foundItemRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/items', itemRoutes); // <--- NEW ROUTE

// Root Test
app.get('/', (req, res) => {
  res.json({ 
    message: 'TigerTrack Backend API is Running',
    endpoints: {
      auth: '/api/auth',
      lost: '/api/lost',
      found: '/api/found',
      dashboard: '/api/dashboard',
      items: '/api/items'
    }
  });
});

// Test Supabase connection
app.get('/api/test-supabase', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    const { data, error } = await supabase.from('found_items').select('count');
    
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        supabaseConfigured: !!process.env.SUPABASE_URL
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Supabase connected successfully',
      supabaseUrl: process.env.SUPABASE_URL 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment check:`);
  console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
  console.log(`   - SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing'}`);
});