const models = require("../models");
const membership = require("../models/membership");
const { getInstanceById } = require("./modelService");

const getAllActivities = async (requesterId, requesterType) => {
  try {
    if (requesterType == "admin" || requesterType == "superadmin") {
      const activities = await models.Activity.findAll();
      if (activities.length > 0) return activities;
      else throw new Error("No activies found");
    }
    if (requesterType == "user") {
      const activies = [];
      const memberships = await models.Membership.findAll({
        where: { userId: requesterId },
        include: [{ model: models.Activity, include: [models.Bill] }],
      });
      if (memberships.length > 0) {
        memberships.map((membership) => {
          if (membership.dataValues.Activities.length > 0) {
            activies.push(...membership.dataValues.Activities);
          }
        });
        if (activies.length > 0) return activies;
        else throw new Error("You have no activites");
      } else throw new Error("You have no memberships");
    }
    if (requesterType == "company") {
      const activies = [];
      const memberships = await models.Membership.findAll({
        where: { companyId: requesterId },
        include: { model: models.Activity },
      });
      if (memberships.length > 0) {
        memberships.map((membership) => {
          if (membership.dataValues.Activities.length > 0) {
            activies.push(...membership.Activities);
          }
        });
        if (activies.length > 0) return activies;
        else throw new Error("You have no activites");
      } else throw new Error("You have no memberships");
    }
  } catch (err) {
    throw new Error(err.message);
  }
};
const getActivity = async (id, requesterId, requesterType) => {
  try {
    const activity = await models.Activity.findByPk(id, { include:[models.Bill] });
    if (activity) {
      if (requesterType == "admin" || requesterType == "superadmin") {
        return activity;
      }
      if (requesterType == "user") {
        const membership = await models.Membership.findOne({
          where: { userId: requesterId },
        });
        if (membership && activity.memberId == membership.id) {
          return activity;
        }
        throw new Error("You have no access to this activity");
      }
      if (requesterType == "company" && activity.Bill.companyId == requesterId) {
        return activity;
      } else
        throw new Error("Your company does not have access to this activity");
    } else throw new Error("Activity not found");
  } catch (err) {
    throw new Error(err.message);
  }
};
module.exports = {
  getAllActivities,
  getActivity,
};
