const { v4 } = require("uuid");
const models = require("../models");
const { getInstanceById } = require("./modelService");

const addMember = async (phone, id) => {
  const membershipNumber = v4();
  console.log(membershipNumber);
  try {
    const user = await models.User.findOne({ where: { phone } });
    const company = await getInstanceById(id, "Company");
    if (!user)
      throw new Error(
        "This phone owner does not have a account in the application"
      );
    if (!company)
      throw new Error(
        "This company does not have a account in the application Or you sholud login again"
      );
    const [membership, created] = await models.Membership.findOrCreate({
      where: {
        userId: user.id,
        companyId: company.id,
      },
      defaults: { membershipNumber: membershipNumber },
    });
    if (created) return membership;
    else return null;
  } catch (err) {
    throw new Error(err.message);
  }
};

const getMembers = async (id) => {
  const user = await getInstanceById(id, 'User')
  console.log(user)
}
module.exports = {
  addMember,
  getMembers
};
