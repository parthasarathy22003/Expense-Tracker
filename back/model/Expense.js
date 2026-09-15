module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define(
    'Expense',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(64),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        get() {
          const raw = this.getDataValue('amount');
          return raw === null || raw === undefined ? null : Number(raw);
        },
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      paymentMode: {
        type: DataTypes.ENUM('CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'OTHER'),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'expenses',
      indexes: [
        { name: 'idx_expenses_user', fields: ['user_id'] },
        { name: 'idx_expenses_category', fields: ['category'] },
        { name: 'idx_expenses_date', fields: ['date'] },
        { name: 'idx_expenses_user_date', fields: ['user_id', 'date'] },
        { name: 'idx_expenses_payment_mode', fields: ['payment_mode'] },
      ],
    }
  );

  return Expense;
};