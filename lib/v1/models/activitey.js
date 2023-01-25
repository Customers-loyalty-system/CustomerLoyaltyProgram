'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activitey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Activitey.init({
    memberId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    standardPoints: DataTypes.INTEGER,
    tiresPoints: DataTypes.INTEGER,
    billId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Activitey',
    paranoid:true
  });
  return Activitey;
};