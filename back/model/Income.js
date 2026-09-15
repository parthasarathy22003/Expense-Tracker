module.exports = (sequelize, DataTypes) => {
  const Income = sequelize.define(
    'Income',
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
      source: {
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
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'incomes',
      indexes: [
        { name: 'idx_incomes_user', fields: ['user_id'] },
        { name: 'idx_incomes_source', fields: ['source'] },
        { name: 'idx_incomes_date', fields: ['date'] },
        { name: 'idx_incomes_user_date', fields: ['user_id', 'date'] },
      ],
    }
  );

  return Income;
};