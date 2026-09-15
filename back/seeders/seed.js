require('dotenv').config();
const { sequelize, Expense, Income } = require('../model');

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education'];
const PAYMENT_MODES = ['CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET'];
const SOURCES = ['Salary', 'Freelance', 'Investment', 'Rental'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randAmount = (min, max) => Number((Math.random() * (max - min) + min).toFixed(2));

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const userId = process.argv[2] || 'user-001';

    const expenses = [];
    for (let i = 0; i < 180; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 180));
      expenses.push({
        userId,
        category: pick(CATEGORIES),
        amount: randAmount(50, 6000),
        date: d.toISOString().slice(0, 10),
        paymentMode: pick(PAYMENT_MODES),
        description: `Seeded expense #${i + 1}`,
      });
    }

    const incomes = [];
    for (let i = 0; i < 6; i += 1) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      incomes.push({
        userId,
        source: i === 0 ? pick(SOURCES) : 'Salary',
        amount: randAmount(45000, 85000),
        date: d.toISOString().slice(0, 10),
        description: `Income entry for month ${d.getMonth() + 1}`,
      });
    }

    await Expense.bulkCreate(expenses);
    await Income.bulkCreate(incomes);

    console.log(`✅ Seeded ${expenses.length} expenses and ${incomes.length} incomes for "${userId}"`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
})();