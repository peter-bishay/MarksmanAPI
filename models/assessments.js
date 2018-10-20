/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('assessments', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'subjects',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    total_mark: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    actual_mark: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    goal_mark: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    time_required: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    memo: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'assessments'
  });
};
