require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://vendanpary_db_user:ZssFL4PiDO9cQhHC@cluster0.7mui6tu.mongodb.net/Ecoevent?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
