require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'expense_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? (msg) => console.log(msg) : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    timezone: '+00:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
    },
    define: {
      underscored: true,   // userId -> user_id, paymentMode -> payment_mode
      timestamps: true,
      freezeTableName: false,
    },
  }
);

module.exports = sequelize;