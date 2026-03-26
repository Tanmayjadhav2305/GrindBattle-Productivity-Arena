const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('--- ATLAS CONNECTION TEST ---');
  console.log('URI:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@')); // Hide password
  
  try {
    // Force a short timeout for testing
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    
    // Test write permission
    const TestModel = mongoose.model('Test', new mongoose.Schema({ name: String }));
    await TestModel.create({ name: 'Connection Test ' + new Date().toISOString() });
    console.log('✅ SUCCESS: Write permission verified!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ FAILURE:', err.message);
    if (err.message.includes('timeout') || err.message.includes('buffering')) {
      console.error('👉 ANALYSIS: Still a network/firewall issue. Check Atlas Whitelist (0.0.0.0/0).');
    } else if (err.message.includes('auth failed')) {
      console.error('👉 ANALYSIS: Incorrect username or password.');
    }
    process.exit(1);
  }
};

testConnection();
