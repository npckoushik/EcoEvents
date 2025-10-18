const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./backend/models/User');
const Product = require('./backend/models/Product');
const Donation = require('./backend/models/Donation');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://vendanpary_db_user:ZssFL4PiDO9cQhHC@cluster0.7mui6tu.mongodb.net/Ecoevent?retryWrites=true&w=majority&appName=Cluster0';

async function uploadSampleData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Donation.deleteMany({});
    console.log('Existing data cleared!');

    // Read sample data files
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-users.json'), 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-products.json'), 'utf8'));
    const donationsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-donations.json'), 'utf8'));

    // Hash passwords for users
    console.log('Hashing passwords...');
    for (let user of usersData) {
      user.password = await bcrypt.hash('password123', 10); // Default password for all users
    }

    // Upload users
    console.log('Uploading users...');
    const users = await User.insertMany(usersData);
    console.log(`Uploaded ${users.length} users successfully!`);

    // Create a mapping of vendor names to user IDs for products and donations
    const vendorMap = {};
    users.forEach(user => {
      if (user.roles.includes('vendor')) {
        vendorMap[user.name] = user._id;
      }
    });

    // Create a mapping of NGO names to user IDs for donations
    const ngoMap = {};
    users.forEach(user => {
      if (user.roles.includes('ngo')) {
        ngoMap[user.name] = user._id;
      }
    });

    // Update products with correct vendor IDs
    console.log('Updating products with vendor IDs...');
    productsData.forEach(product => {
      // Use the first vendor ID for all products (you can modify this logic)
      product.vendor = users.find(u => u.roles.includes('vendor'))._id;
    });

    // Upload products
    console.log('Uploading products...');
    const products = await Product.insertMany(productsData);
    console.log(`Uploaded ${products.length} products successfully!`);

    // Update donations with correct vendor and NGO IDs
    console.log('Updating donations with vendor and NGO IDs...');
    donationsData.forEach(donation => {
      // Use the first vendor ID for all donations
      donation.vendor = users.find(u => u.roles.includes('vendor'))._id;
      
      // If donation has requestedBy, use the first NGO ID
      if (donation.requestedBy) {
        donation.requestedBy = users.find(u => u.roles.includes('ngo'))._id;
      }
    });

    // Upload donations
    console.log('Uploading donations...');
    const donations = await Donation.insertMany(donationsData);
    console.log(`Uploaded ${donations.length} donations successfully!`);

    console.log('\n=== UPLOAD SUMMARY ===');
    console.log(`Users uploaded: ${users.length}`);
    console.log(`Products uploaded: ${products.length}`);
    console.log(`Donations uploaded: ${donations.length}`);
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('All users have the password: password123');
    console.log('\nSample login emails:');
    console.log('- Vendor: contact@greenevents.com');
    console.log('- NGO: contact@hopefoundation.org');
    console.log('- Customer: sarah.johnson@email.com');

    console.log('\nSample data uploaded successfully! 🎉');

  } catch (error) {
    console.error('Error uploading sample data:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the upload function
uploadSampleData();
