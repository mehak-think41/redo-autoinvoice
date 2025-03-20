require('dotenv').config();

const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const { inventory } = require('./data/mockInventory');

async function seedDatabase() {
  try {
    // Connect to your MongoDB database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing inventory data
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory data');

    // Add the user ID to each inventory item
    const userId = '67db9cefeee8ebd30a1fb7a1'; // Replace with the actual user ID
    const inventoryWithUserId = inventory.map((item) => ({
      ...item,
      userId,
    }));

    // Insert mock data with user ID
    const result = await Inventory.insertMany(inventoryWithUserId);
    console.log(`Successfully inserted ${result.length} inventory items`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();