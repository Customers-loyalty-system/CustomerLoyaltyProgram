const models = require("../models");

const addBill = async (params) => {
  try {
    const company = await models.Company.findOne({
      where: { email: params.companyEmail },
    });
    if (company) {
      params.companyId = company.id;
      delete params.companyEmail
    }else return null
    const [bill, created] = await models.Bill.findOrCreate({
      where: { billReference: params.billReference },
      defaults: {
        ...params,
      },
    });
    if (created) {
      return bill;
    } else {
      return null;
    }
  } catch (err) {
    throw new Error('Server Error, Please call the call service');
  }
};

module.exports = {
  addBill,
};
