const { addActivity } = require("./activityServices");
const { getConfigurations } = require("./configurationService");
const { getRelationByUserId } = require("./memberrelationServices");
const { getMembershipByUserId } = require("./membershipServices");
const { getRules } = require("./ruleServices");
const { getUserByPhoneNumber } = require("./userServices");

const calculatePoints = (rules, amount) => {
  let points = 0;
  rules.map((rule) => {
    if (rule.dataValues.condition <= amount) {
      points = rule.dataValues.earnedPoints;
    }
  });
  return points;
};

const checkTiresAndExchangePoints = (
  configurations,
  standardPoints,
  tiresPoints
) => {
  let tier = null;
  configurations.map((config) => {
    if (
      config.dataValues.key == "Minimum exchange points" &&
      config.dataValues.value <= standardPoints
    ) {
      console.log("You can change your points now"); // send email to the user that he can change points
    } else if (
      config.dataValues.value <= tiresPoints &&
      config.dataValues.key != "Minimum exchange points"
    )
      tier = config.dataValues.key;
  });
  return tier;
};

// const addPointsToMembersRelation = async (relation)  => { 

// }
const mainProcedure = async (bill, phone, type) => {
  try {
    const user = await getUserByPhoneNumber(phone);
    if (!user)
      throw new Error(
        "This phone number does not have account in loyalty application"
      );
    const membership = await getMembershipByUserId(user.id, bill.companyId);
    if (!membership)
      throw new Error(
        "This phone number does not have a membership in your company, You can add it from add members"
      );
    const rules = await getRules(bill.companyId);
    const points = calculatePoints(rules, bill.amount);
//  const relation = await getRelationByUserId(membership.id) 
//    if ( relation ) { await addPointsToMembersRelation(relation)}
    if (type == "Purchase points") {
      await membership.update({
        standardPoints: membership.standardPoints + points,
        tiresPoints: membership.tiresPoints + points,
      });
      if (!membership)
        throw new Error(
          "Something went wrong the points did not change, Please contact the call service"
        );
    }
    if (type == "Lost points") {
      await membership.update({
        standardPoints: membership.standardPoints - points,
        tiresPoints: membership.tiresPoints - points,
      });
      if (!membership)
        throw new Error(
          "Something went wrong the points did not change, Please contact the call service"
        );
    }
    const activity = await addActivity({
      memberId: membership.id,
      type,
      standardPoints: points,
      tiresPoints: points,
      billId: bill.id,
    });
    if (!activity)
      throw new Error(
        "The operation did not save in the activity, but the points has been added successfully"
      );
    const configurations = await getConfigurations(bill.companyId);
    const newTire = checkTiresAndExchangePoints(
      configurations,
      membership.standardPoints,
      membership.tiresPoints
    );
    if (newTire != null && newTire != membership.membershipTier) {
      await membership.update({
        membershipTier: newTire,
      });
    }
    
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  mainProcedure,
};
