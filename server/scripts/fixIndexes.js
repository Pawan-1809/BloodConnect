require('dotenv').config();

const mongoose = require('mongoose');

async function dropIfExists(collection, indexName) {
  const indexes = await collection.indexes();
  const exists = indexes.some((idx) => idx.name === indexName);

  if (!exists) {
    console.log(`Index not present: ${indexName}`);
    return;
  }

  await collection.dropIndex(indexName);
  console.log(`Dropped index: ${indexName}`);
}

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in environment');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const bloodStocks = db.collection('bloodstocks');

  // Legacy problematic index from nested unique path in BloodStock schema.
  await dropIfExists(bloodStocks, 'units.unitId_1');

  await mongoose.disconnect();
  console.log('Done.');
}

run()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Index fix failed:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // no-op
    }
    process.exit(1);
  });
