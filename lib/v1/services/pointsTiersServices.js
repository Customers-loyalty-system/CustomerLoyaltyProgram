const { getTierMail } = require("../utils/emailsUtile");
const { sendEmail } = require("../utils/emailUtile");
const { checkTiersAndExchangePoints } = require("../utils/tiersUtile");
const { addActivity } = require("./activityServices");
const { getConfigurations } = require("./configurationService");
const { updateMembershipPoints } = require("./membershipServices");

const setPointsAndTiersToMember = async (
  member,
  standardPoints,
  tiersPoints,
  billId,
  relationPoints,
  companyId,
  user,
  oldStandardPoints,
  type
) => {
  let updatedMember = await updateMembershipPoints(
    member,
    standardPoints,
    tiersPoints
  );

  if (!updatedMember)
    throw new Error(
      "The points did not added, please let the member contact the call service"
    );

  const activity = await addActivity({
    memberId: updatedMember.id,
    type,
    standardPoints: relationPoints,
    tiersPoints: relationPoints,
    billId: billId,
  });

  if (!activity)
    throw new Error(
      "The operation did not save in the activity, but the points has been added successfully"
    );

  const configurations = await getConfigurations(companyId);
  const config = configurations[0];
  const newTier = await checkTiersAndExchangePoints(
    configurations,
    updatedMember.standardPoints,
    updatedMember.tiersPoints,
    user,
    oldStandardPoints
  );
  if (newTier != null && newTier != updatedMember.membershipTier) {
    updatedMember = await updatedMember.update({ membershipTier: newTier });
    if (updatedMember && type == "Purchase points") {
      let email = getTierMail(
        config.dataValues.Company.name,
        { title: user.title, name: user.name, surname: user.surname },
        newTier
      );
      sendEmail(user.email, email);
    }
  }
  return updatedMember;
};
module.exports = {
  setPointsAndTiersToMember
};
