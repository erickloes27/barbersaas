const bcrypt = require('bcryptjs');
console.log('Bcrypt loaded');
console.log(bcrypt.hashSync('test', 10));
