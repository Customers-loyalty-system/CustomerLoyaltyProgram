'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Membership.init({
    companyId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    membershipNumber: DataTypes.STRING,
    starderdPoints: DataTypes.INTEGER,
    tiresPoints: DataTypes.INTEGER,
    memmbershipTier: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Membership',
    paranoid:true
  });
  return Membership;
};