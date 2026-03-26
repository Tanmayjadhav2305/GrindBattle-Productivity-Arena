const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/grindbattle')
  .then(async () => {
    try {
      await mongoose.connection.collection('users').dropIndex('username_1');
      console.log('INDEX_DROPPED');
    } catch (err) {
      console.log('INDEX_NOT_FOUND_OR_ERROR:', err.message);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
