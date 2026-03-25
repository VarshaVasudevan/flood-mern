const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flood_monitoring';

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure MongoDB is installed and running');
    console.log('2. Run "mongod" in terminal to start MongoDB locally');
    console.log('3. Or use MongoDB Atlas (cloud) by setting MONGODB_URI environment variable');
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ MongoDB connection established and ready');
});

// Location Schema
const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  region: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  waterLevel: { type: Number, default: 0 },
  rainfall: { type: Number, default: 0 },
  temperature: { type: Number, default: 0 },
  humidity: { type: Number, default: 0 },
  riskLevel: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Critical'],
    default: 'Low'
  },
  status: {
    type: String,
    enum: ['Normal', 'Alert', 'Warning', 'Evacuation'],
    default: 'Normal'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  alertMessage: { type: String, default: '' }
});

const Location = mongoose.model('Location', locationSchema);

// Generate 30 Locations with Dummy Data
const generateLocations = async () => {
  const locationsData = [
    { name: "River Valley North", region: "Northern Region", lat: 40.7128, lng: -74.0060 },
    { name: "Delta Point", region: "Coastal Region", lat: 34.0522, lng: -118.2437 },
    { name: "Floodplain East", region: "Eastern District", lat: 41.8781, lng: -87.6298 },
    { name: "Mountain Creek", region: "Western Region", lat: 39.9526, lng: -75.1652 },
    { name: "Coastal Harbor", region: "Coastal Region", lat: 32.7157, lng: -117.1611 },
    { name: "Valley Springs", region: "Central Valley", lat: 37.7749, lng: -122.4194 },
    { name: "Riverside Park", region: "Eastern District", lat: 38.6270, lng: -90.1994 },
    { name: "Lake View", region: "Northern Region", lat: 42.3601, lng: -71.0589 },
    { name: "Bay Bridge", region: "Coastal Region", lat: 37.7749, lng: -122.4194 },
    { name: "Forest Hills", region: "Western Region", lat: 45.5152, lng: -122.6784 },
    { name: "Meadow Brook", region: "Central Valley", lat: 40.7128, lng: -74.0060 },
    { name: "Sunset Beach", region: "Coastal Region", lat: 33.7490, lng: -84.3880 },
    { name: "Crystal Lake", region: "Northern Region", lat: 47.6062, lng: -122.3321 },
    { name: "Pine Forest", region: "Western Region", lat: 38.9072, lng: -77.0369 },
    { name: "Oak Valley", region: "Central Valley", lat: 39.7392, lng: -104.9903 },
    { name: "Maple Ridge", region: "Eastern District", lat: 41.4993, lng: -81.6944 },
    { name: "Willow Creek", region: "Northern Region", lat: 43.6510, lng: -79.3470 },
    { name: "Cedar Point", region: "Coastal Region", lat: 32.2226, lng: -110.9747 },
    { name: "Birchwood", region: "Western Region", lat: 44.9778, lng: -93.2650 },
    { name: "Aspen Grove", region: "Central Valley", lat: 36.1627, lng: -86.7816 },
    { name: "Redwood Forest", region: "Northern Region", lat: 38.5816, lng: -121.4944 },
    { name: "Iron Bridge", region: "Eastern District", lat: 42.6526, lng: -73.7562 },
    { name: "Stone Harbor", region: "Coastal Region", lat: 27.9506, lng: -82.4572 },
    { name: "Golden Gate", region: "Western Region", lat: 37.8199, lng: -122.4783 },
    { name: "Silver Lake", region: "Central Valley", lat: 34.0522, lng: -118.2437 },
    { name: "Emerald Bay", region: "Coastal Region", lat: 33.4484, lng: -112.0740 },
    { name: "Diamond Head", region: "Northern Region", lat: 21.3069, lng: -157.8583 },
    { name: "Sapphire Coast", region: "Coastal Region", lat: 25.7617, lng: -80.1918 },
    { name: "Ruby Falls", region: "Western Region", lat: 35.0456, lng: -85.3097 },
    { name: "Pearl Harbor", region: "Coastal Region", lat: 21.3670, lng: -157.9296 }
  ];

  console.log('🔄 Generating locations...');

  for (let loc of locationsData) {
    const waterLevel = parseFloat((Math.random() * 10).toFixed(2));
    const rainfall = parseFloat((Math.random() * 100).toFixed(2));
    
    let riskLevel = 'Low';
    let status = 'Normal';
    let alertMessage = '';
    
    if (waterLevel > 7) {
      riskLevel = 'Critical';
      status = 'Evacuation';
      alertMessage = '⚠️ IMMEDIATE EVACUATION REQUIRED! Water levels critical.';
    } else if (waterLevel > 5) {
      riskLevel = 'High';
      status = 'Warning';
      alertMessage = '⚠️ High flood risk. Prepare for evacuation immediately.';
    } else if (waterLevel > 3) {
      riskLevel = 'Moderate';
      status = 'Alert';
      alertMessage = '⚠️ Moderate flood risk. Monitor conditions closely.';
    } else {
      riskLevel = 'Low';
      status = 'Normal';
      alertMessage = '✅ Normal conditions. Continue monitoring.';
    }
    
    const locationData = {
      name: loc.name,
      region: loc.region,
      coordinates: {
        lat: loc.lat,
        lng: loc.lng
      },
      waterLevel: waterLevel,
      rainfall: rainfall,
      temperature: parseFloat((Math.random() * 30 + 10).toFixed(2)),
      humidity: parseFloat((Math.random() * 60 + 30).toFixed(2)),
      riskLevel,
      status,
      alertMessage,
      lastUpdated: new Date()
    };
    
    try {
      // Fixed: Use returnDocument: 'after' instead of new: true
      await Location.findOneAndUpdate(
        { name: loc.name },
        locationData,
        { upsert: true, returnDocument: 'after' }
      );
    } catch (error) {
      console.error(`Error saving ${loc.name}:`, error.message);
    }
  }
  
  const count = await Location.countDocuments();
  console.log(`✅ ${count} locations generated/updated`);
  return count;
};

// API Routes
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find().sort({ waterLevel: -1 });
    console.log(`📊 Sending ${locations.length} locations`);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/locations/risk/:level', async (req, res) => {
  try {
    const locations = await Location.find({ riskLevel: req.params.level });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/locations/statistics', async (req, res) => {
  try {
    const totalLocations = await Location.countDocuments();
    const criticalLocations = await Location.countDocuments({ riskLevel: 'Critical' });
    const highRiskLocations = await Location.countDocuments({ riskLevel: 'High' });
    const moderateLocations = await Location.countDocuments({ riskLevel: 'Moderate' });
    const lowLocations = await Location.countDocuments({ riskLevel: 'Low' });
    
    const avgWaterLevelResult = await Location.aggregate([{ $group: { _id: null, avg: { $avg: '$waterLevel' } } }]);
    
    const stats = [
      { _id: 'Critical', count: criticalLocations },
      { _id: 'High', count: highRiskLocations },
      { _id: 'Moderate', count: moderateLocations },
      { _id: 'Low', count: lowLocations }
    ];
    
    res.json({
      stats,
      totalLocations,
      criticalLocations,
      highRiskLocations,
      moderateLocations,
      lowLocations,
      averageWaterLevel: avgWaterLevelResult[0]?.avg || 0
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/locations/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/locations/:id', async (req, res) => {
  try {
    // Fixed: Use returnDocument: 'after' instead of new: true
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, returnDocument: 'after' }
    );
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: states[dbState] || 'unknown',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check database content
app.get('/api/debug/count', async (req, res) => {
  try {
    const count = await Location.countDocuments();
    const sample = await Location.findOne();
    res.json({
      totalLocations: count,
      sample: sample,
      dbState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server and initialize data
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   - GET /api/locations - Get all locations`);
      console.log(`   - GET /api/locations/statistics - Get statistics`);
      console.log(`   - GET /api/health - Check server health`);
      console.log(`   - GET /api/debug/count - Debug database`);
    });
    
    // Wait for database connection before generating data
    mongoose.connection.once('open', async () => {
      console.log('📊 Database ready, checking existing data...');
      
      // Check if we already have data
      const existingCount = await Location.countDocuments();
      if (existingCount === 0) {
        console.log('No existing data found, generating initial data...');
        const count = await generateLocations();
        console.log(`✅ Initial data generation complete with ${count} locations`);
      } else {
        console.log(`✅ Found ${existingCount} existing locations, updating data...`);
        const count = await generateLocations();
        console.log(`✅ Data updated, now have ${count} locations`);
      }
      
      // Update data every 5 minutes
      setInterval(async () => {
        await generateLocations();
        console.log('🔄 Location data updated at:', new Date().toLocaleTimeString());
      }, 300000);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();