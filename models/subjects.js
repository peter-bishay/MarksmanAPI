/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('subjects', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    goal_mark: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'subjects'
  });
};
