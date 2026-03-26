const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/grindbattle')
  .then(async () => {
    console.log('CONNECTED');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('COLLECTIONS:', collections.map(c => c.name));
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
