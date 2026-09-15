const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.js');

const Expense = require('./Expense')(sequelize, DataTypes);
const Income = require('./Income')(sequelize, DataTypes);

module.exports = { sequelize, Expense, Income };