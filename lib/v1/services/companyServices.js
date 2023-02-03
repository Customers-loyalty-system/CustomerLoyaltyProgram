const {
  companyTransformer,
  companiesTransformer,
} = require("../transformer/companyTransformer");
const { hashPassword, verifyPassword } = require("../utils/passwordUtile");
const models = require("../models");
const { getInstanceById } = require("./modelService");
const {
  membershipTransformer, membershipsTransformer,
} = require("../transformer/membershipTransformer");
const { userTransformer } = require("../transformer/userTransformer");
const { getUserByPhoneNumber } = require("./userServices");
const { getMembershipByUserId } = require("./membershipServices");
const { tierService } = require("./tierService");
const { addActivity } = require("./activityServices");

const addCompany = async (params) => {
  params.password = hashPassword(params.password);
  try {
    const [company, created] = await models.Company.findOrCreate({
      where: { email: params.email },
      defaults: {
        ...params,
      },
    });
    if (created) {
      const config = await models.Configuration.create({
        companyId: company.id,
        key: "Bronze",
        value: 0,
      });
      return companyTransformer(company);
    }
    return null;
  } catch (err) {
    throw new Error(err.message);
  }
};

const companyLoginService = async (email, password) => {
  try {
    var company = await models.Company.findOne({
      where: {
        email,
      },
    });
    if (company) {
      if (verifyPassword(password, company.password)) {
        return companyTransformer(company);
      } else {
        throw new Error("Invalid company password!");
      }
    }
    return null;
  } catch (err) {
    throw new Error(err);
  }
};

const getCompany = async (id) => {
  try {
    const company = await getInstanceById(id, "Company");
    if (company) return companyTransformer(company);
    else throw new Error(company);
  } catch (err) {
    throw new Error(err);
  }
};

const updateCompany = async (id, params) => {
  params.password = hashPassword(params.password);
  try {
    const company = await getInstanceById(id, "Company");
    if (company) {
      await company.update({
        ...params,
      });
      return companyTransformer(company);
    }
    throw new Error("company not found");
  } catch (err) {
    throw new Error(err.parent.sqlMessage);
  }
};

const deleteCompany = async (id) => {
  try {
    const company = await getInstanceById(id, "Company");
    if (company) {
      const removedCompany = await company.destroy();
      if (removedCompany) return removedCompany;
    }
  } catch (err) {
    throw new Error(err);
  }
};
const getAllCompanies = async () => {
  try {
    const companies = await models.Company.findAll();
    if (companies) return companiesTransformer(companies);
    throw new Error("No companies Found");
  } catch (err) {
    throw new Error(err);
  }
};
const getCompanyMembersService = async (id) => {
  try {
    const companyMembers = await models.Membership.findAll({
      where: { companyId: id },
      include: {
        model: models.User,
        attributes: [
          "name",
          "surname",
          "email",
          "phone",
          "gender",
          "title",
          "avatar",
        ],
      },
    });
    if (companyMembers.length > 0) {
      companyMembers.map((membership) => {
        membershipParser = userTransformer(membership.dataValues.User);
        delete membership.dataValues.User;
        membership.dataValues.User = membershipParser;
      });
      return membershipsTransformer(companyMembers);
    } else throw new Error("You have no members yet");
  } catch (err) {
    throw new Error(err);
  }
};
const getCompanyMembersRelationsService = async (companyId) => {
  try {
    const companyMembersRelations = await models.MemberRelation.findAll({
      where: { companyId: companyId },
    });
    if (companyMembersRelations.length > 0)
      return membershipsTransformer(companyMembersRelations);
    else throw new Error("No members relations found");
  } catch (err) {
    throw new Error(err);
  }
};

const exchangePointsService = async (phone, companyId) => {
  try {
    const user = await models.User.findOne({
      where: { phone },
    });
    if (!user)
      throw new Error(
        "The member did not found, Please check the phone number again "
      );
    const membership = await models.Membership.findOne({
      where: { userId: user.id, companyId },
    });
    if (!membership)
      throw new Error(
        "The member did not found, Please check the phone number again"
      );
    const config = await models.Configuration.findOne({
      where: {
        companyId,
        key: "Minimum exchange points",
      },
    });
    if (config.value < membership.standardPoints) {
      await membership.update({
        standardPoints: membership.standardPoints - config.value,
      });
      return membershipTransformer(membership);
    } else throw new Error("The member does not have enough points");
  } catch (err) {
    throw new Error(err.message);
  }
};
const companyGiftServices = async (params, companyId) => {
  try {
    params.points = parseInt(params.points);
    const user = await getUserByPhoneNumber(params.phone);
    if (!user)
      throw new Error("There is no user registerd with this phone number");
    const member = await getMembershipByUserId(user.id, companyId);
    if (!member)
      throw new Error("This phone number is not a member in your company");
    let oldStandardPoints = member.standardPoints;
    let updatedMember;
    if (params.tier == "Standard points") {
       updatedMember = await member.update({
        standardPoints: member.standardPoints + params.points,
      });
      if (!updatedMember)
        throw new Error("Something went wrong, Please try again later");
        updatedMember= await tierService(
        companyId,
        updatedMember,
        user,
        oldStandardPoints,
        type = null
      );
      const activity = await addActivity({
        memberId: updatedMember.id,
        type: `${params.tier} sent form company as gift`,
        standardPoints:params.points,
        tiersPoints: 0,
        billId: null,
      });
      if (!activity)
        throw new Error(
          "The operation did not save in the activity, but the points has been added successfully"
        );
    }
    if (params.tier == "Tiers points") {
       updatedMember = await member.update({
        tiersPoints: member.tiersPoints + params.points,
      });
      if (!updatedMember)
        throw new Error("Something went wrong, Please try again later");
      updatedMember = await tierService(
        companyId,
        updatedMember,
        user,
        oldStandardPoints,
        type= `${params.tier} as company gift`
      );
    const activity = await addActivity({
      memberId: updatedMember.id,
      type: `${params.tier} sent from company as gift`,
      standardPoints: 0,
      tiersPoints: params.points,
      billId: null,
    });
    if (!activity)
      throw new Error(
        "The operation did not save in the activity, but the points has been added successfully"
      );
    }
    updatedMember.user = userTransformer (updatedMember.User)
    delete updatedMember.User
    if(updatedMember) return membershipTransformer(updatedMember)
    else throw new Error('Points did not added, Please try again later')
  } catch (err) {
    throw new Error(err.message);
  }
};
module.exports = {
  addCompany,
  companyLoginService,
  getCompany,
  updateCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyMembersService,
  getCompanyMembersRelationsService,
  exchangePointsService,
  companyGiftServices,
};
