const { Op } = require("sequelize");
const models = require("../models");
const {
  membershipsTransformer,
} = require("../transformer/membershipTransformer");
const { companyTransformer } = require("../transformer/companyTransformer");
const {
  userTransformer,
  usersTransformer,
} = require("../transformer/userTransformer");
const { hashPassword, verifyPassword } = require("../utils/passwordUtile");

const { getInstanceById } = require("./modelService");
const {
  memberRelationsTransformer,
} = require("../transformer/memberrelationTransfomer");
const { getMembershipByUserId } = require("./membershipServices");
const { setPointsAndTiersToMember } = require("./pointsTiersServices");
const { tierService } = require("./tierService");
const { addActivity } = require("./activityServices");
const addUser = async (params) => {
  params.birthdate = Date.parse(params.birthdate);
  params.password = hashPassword(params.password);
  try {
    const [user, created] = await models.User.findOrCreate({
      where: { [Op.or]: [{ phone: params.phone }, { email: params.email }] },
      defaults: {
        ...params,
      },
    });
    if (created) {
      if (user?.dataValues?.birthdate) {
        user.dataValues.birthdate = user?.dataValues?.birthdate
          .toJSON()
          .slice(0, 10);
      }
      return userTransformer(user);
    }
    return null;
  } catch (err) {
    throw new Error(err.parent.sqlMessage);
  }
};

const userLoginService = async (email, password) => {
  try {
    var user = await models.User.findOne({
      where: {
        email,
      },
    });
    if (user) {
      if (verifyPassword(password, user.password)) {
        return userTransformer(user);
      } else {
        throw new Error("Invalid user password!");
      }
    }
    return null;
  } catch (err) {
    throw new Error(err);
  }
};
const getUser = async (id) => {
  try {
    const user = await getInstanceById(id, "User");
    if (user) return userTransformer(user);
    else throw new Error(user);
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateUser = async (id, params) => {
  params.birthdate = Date.parse(params.birthdate);
  params.password = hashPassword(params.password);
  try {
    const user = await getInstanceById(id, "User");
    if (user) {
      await user.update({
        ...params,
      });
      if (user?.dataValues?.birthdate) {
        user.dataValues.birthdate = user?.dataValues?.birthdate
          .toJSON()
          .slice(0, 10);
      }
      return userTransformer(user);
    }
    throw new Error("User not found");
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteUser = async (id) => {
  const user = await getInstanceById(id, "User");

  try {
    if (user) {
      const removedUser = await user.destroy();
      if (removedUser) return removedUser;
      return null;
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAllUsers = async () => {
  try {
    const users = await models.User.findAll();
    if (users.length > 0) return usersTransformer(users);
    throw new Error("No users Found");
  } catch (err) {
    throw new Error(err);
  }
};

const getUserMembershipsService = async (id) => {
  try {
    const userMemberships = await models.Membership.findAll({
      where: { userId: id },
      include: {
        model: models.Company,
        include: models.Configuration,
      },
      order :[['createdAt', 'DESC']]
    });
    if (userMemberships.length > 0) {
      userMemberships.map((membership) => {
        membershipParser = companyTransformer(membership.dataValues.Company);
        delete membership.dataValues.Company;
        membership.dataValues.company = membershipParser;
      });
      return membershipsTransformer(userMemberships);
    } else throw new Error("You have no membership yet");
  } catch (err) {
    throw new Error(err.message);
  }
};

const getUserMemberRelatiosService = async (id) => {
  try {
    // the id should be the membership id
    const userMemberRelations = await models.Membership.findAll({
      where: {
        userId: id,
      },
      include: ["firstMember", "secondMember"],
      order :[['createdAt', 'DESC']]
    });
    const relations = [];
    if (userMemberRelations.length > 0) {
      userMemberRelations.map((userMemberRelation) => {
        if (userMemberRelation?.firstMember?.length > 0) {
          relations.push(...userMemberRelation?.dataValues.firstMember);
        }
        if (userMemberRelation?.secondMember?.length > 0) {
          relations.push(...userMemberRelation?.dataValues.secondMember);
        }
      });
      if (relations.length > 0) return memberRelationsTransformer(relations);
      else throw new Error("No member relations found");
    }
    throw new Error("No member relations found");
  } catch (err) {
    throw new Error(err.message);
  }
};

const getUserByPhoneNumber = async (phone) => {
  try {
    const user = await models.User.findOne({ where: { phone } });
    if (user) return user;
    else return null;
  } catch (err) {
    throw new Error(err.message);
  }
};
const sharePointsService = async (params, senderId) => {
  params.points = parseInt(params.points);
  try {
    const company = await models.Company.findOne({
      where: { name: params.companyName },
    });
    if (!company)
      throw new Error("Company not found, Please check the company name");
    const receiver = await getUserByPhoneNumber(params.phone);
    if (!receiver) throw new Error("The points receiver user is not found");
    const senderMember = await getMembershipByUserId(senderId, company.id);
    let senderMemberOldStandardPoints = senderMember.standardPoints;
    let senderMemberOldTiersPoints = senderMember.tiersPoints;

    if (!senderMember)
      throw new Error("You do not have a membership in the company");
    const receiverMember = await getMembershipByUserId(receiver.id, company.id);
    let receiverMemberOldStandardPoints = receiverMember.standardPoints;
    let receiverMemberOldTiersPoints = receiverMember.tiersPoints;

    if (!receiverMember)
      throw new Error("You do not have a membership in the company");
    let updateSenderMember = null;
    let updateReceiverMember = null;
    if (
      params.tier == "Standard points" &&
      senderMember.dataValues.standardPoints >= params.points
    ) {
      let receivedPoints = receiverMember.standardPoints + params.points;
      updateReceiverMember = await receiverMember.update({
        standardPoints: receivedPoints,
      });
      if (updateReceiverMember) {
        await tierService(
          company.id,
          updateReceiverMember,
          updateReceiverMember.User,
          receiverMemberOldStandardPoints,
          (type = `${params.tier} gift`)
        );
      }

      const activity = await addActivity({
        memberId: updateReceiverMember.id,
        type: `${params.tier} gift`,
        standardPoints: params.points,
        tiersPoints: 0,
        billId: null,
      });

      if (!activity)
        throw new Error(
          "The operation did not save in the activity, but the points has been added successfully"
        );

      let senderPoints = senderMember.standardPoints - params.points;
      updateSenderMember = await senderMember.update({
        standardPoints: senderPoints,
      });

      if (updateSenderMember) {
        await tierService(
          company.id,
          updateSenderMember,
          updateSenderMember.User,
          senderMemberOldStandardPoints,
          (type = null)
        );
        const activity = await addActivity({
          memberId: updateSenderMember.id,
          type: `Send ${params.tier} gift`,
          standardPoints: params.points,
          tiersPoints: 0,
          billId: null,
        });
        if (!activity)
          throw new Error(
            "The operation did not save in the activity, but the points has been added successfully"
          );
      }
    }
    if (
      params.tier == "Tiers points" &&
      senderMember.dataValues.tiersPoints >= params.points
    ) {
      let receivedPoints = receiverMember.tiersPoints + params.points;
      updateReceiverMember = await receiverMember.update({
        tiersPoints: receivedPoints,
      });
      if (updateReceiverMember) {
        await tierService(
          company.id,
          updateReceiverMember,
          updateReceiverMember.User,
          receiverMember.standardPoints,
          (type = `${params.tier} gift`)
        );
        const activity = await addActivity({
          memberId: updateReceiverMember.id,
          type: `${params.tier} gift`,
          standardPoints: 0,
          tiersPoints: params.points,
          billId: null,
        });

        if (!activity)
          throw new Error(
            "The operation did not save in the activity, but the points has been added successfully"
          );
      }
      let senderPoints = senderMember.tiersPoints - params.points;
      updateSenderMember = await senderMember.update({
        tiersPoints: senderPoints,
      });
      if (updateSenderMember) {
        await tierService(
          company.id,
          updateSenderMember,
          updateSenderMember.User,
          senderMember.standardPoints,
          (type = null)
        );
        const activity = await addActivity({
          memberId: updateSenderMember.id,
          type: `Send ${params.tier} gift`,
          standardPoints: 0,
          tiersPoints: params.points,
          billId: null,
        });
        if (!activity)
          throw new Error(
            "The operation did not save in the activity, but the points has been added successfully"
          );
      }
    }
    if (updateReceiverMember && updateSenderMember)
      return {
        sender: userTransformer(updateReceiverMember),
        receiver: userTransformer(updateSenderMember),
      };
    else throw new Error("You have no enough points");
  } catch (err) {
    throw new Error(err.message);
  }
};
module.exports = {
  addUser,
  userLoginService,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserMembershipsService,
  getUserMemberRelatiosService,
  getUserByPhoneNumber,
  sharePointsService,
};
