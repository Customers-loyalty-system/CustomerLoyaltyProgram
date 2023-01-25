'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Rule.init({
    companyId: DataTypes.INTEGER,
    condiation: DataTypes.INTEGER,
    earnedPoints: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Rule',
    paranoid:true
  });
  return Rule;
};