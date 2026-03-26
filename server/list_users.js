const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect('mongodb://localhost:27017/grindbattle')
  .then(async () => {
    const users = await User.find({});
    console.log('TOTAL_USERS:', users.length);
    console.log('USER_NAMES:', users.map(u => u.name));
    console.log('USER_USERNAMES:', users.map(u => u.username));
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
