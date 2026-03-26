const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect('mongodb://localhost:27017/grindbattle')
  .then(async () => {
    const user = await User.findOne({ email: 'tanmayjadhav2305@gmail.com' });
    console.log('USER_EXISTS:', !!user);
    if (user) console.log('USER_DETAILS:', user);
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR:', err.message);
    process.exit(1);
  });
