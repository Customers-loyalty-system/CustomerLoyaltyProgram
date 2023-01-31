const models = require("../models");
const { getInstanceById } = require("./modelService");
const { mainProcedure } = require("./procedureServices");

const addBill = async (id, params) => {
  params.companyId = id;
  try {
    const company = await getInstanceById(id, "Company");
    if (company) {
      const [bill, created] = await models.Bill.findOrCreate({
        where: { billReference: params.billReference },
        defaults: {
          ...params,
        },
      });
      if (created) {
        if (params.phoneNumber != "") {
          try {
            const result = await mainProcedure(
              bill.dataValues,
              params.phoneNumber,
              (type = "Purchase points")
            );
          } catch (err) {
            bill.message = err.message;
          }
        }
        return bill;
      } else {
        throw new Error("Bill already exist!");
      }
    } else return null;
  } catch (err) {
    throw new Error(
      "loyalty application has server error, Please let the custmer call the loyaty application call service to gain his points"
    );
  }
};
const removeBill = async (billNumber) => {
  const findBill = await models.Bill.findOne({
    where: {
      billNumber: billNumber,
    },
  });
  try {
    if (findBill) {
      const bill = await findBill.destroy();
      if (bill) {
        const member = await models.Activity.findOne({
          where: { billId: bill.id },
          include: {model : models.Membership, include: models.User}
        });
        const phone = member.dataValues.Membership.User.phone
        try {
          const result = await mainProcedure(
            bill.dataValues,
            phone,
            (type = "Lost points")
          );
        } catch (err) {
          bill.message = err.message;
        }
        return bill;
      } else return null;
    }
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  addBill,
  removeBill,
};
