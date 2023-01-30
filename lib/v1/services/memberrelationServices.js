const { Op } = require("sequelize");
const models = require("../models");
const { companyTransformer } = require("../transformer/companyTransformer");
const {
  memberRelationTransformer,
  memberRelationsTransformer,
} = require("../transformer/memberrelationTransfomer");
const {
  membershipTransformer,
} = require("../transformer/membershipTransformer");
const { getInstanceById } = require("./modelService");

const addRelation = async (firstMemberId, phone, companyName, type) => {
  try {
    const secondMember = await models.User.findOne({ where: { phone } });
    if (secondMember) {
      if (secondMember.id == firstMemberId) throw new Error('You can not have a relation with yourself')
      const company = await models.Company.findOne({
        where: { name: companyName },
      });
      if (company) {
        const membership = await models.Membership.findOne({
          where: { userId: firstMemberId, companyId: company.id },
        });
        if (membership) {
          const secondMemberMembiership = await models.Membership.findOne({
            where: { userId: secondMember.id, companyId: company.id },
          });
          if (secondMemberMembiership) {
            const [relation, created] =
              await models.MemberRelation.findOrCreate({
                where: { firstMemberId : membership.id, secondMemberId: secondMemberMembiership.id },
                defaults: {
                  companyId: company.id,
                  type: type,
                },
              });
            if (created) return relation;
            else throw new Error("You already have a member relation");
          } else
            throw new Error(
              "The phone you provied does not have a membership in the company, Please ask him or to her start a membership in the company"
            );
        } else throw new Error("You do not have membership in this company ");
      } else throw new Error("Company not found");
    } else
      throw new Error(
        "The phone you provied does not have account in our website, Please ask him or her to create account in our website and start a membership in the company as well"
      );
  } catch (err) {
    throw new Error(err.message);
  }
};

const getAllRelations = async () => {
  try {
    const relations = await models.MemberRelation.findAll();
    if (relations.length > 0) return memberRelationsTransformer(relations);
    else throw new Error("No members relations found");
  } catch (err) {
    throw new Error(err.message);
  }
};

const getRelation = async (id, requesterId, requesterType) => {
  try {
    var membershipRelation;
    // if the user type admin or superAdmin
    if (requesterType == "superadmin" || requesterType == "admin") {
      membershipRelation = await models.MemberRelation.findOne({
        where: { id },
        include: [
          {
            model: models.Company,
            attributes: [
              "name",
              "email",
              "phone",
              "address",
              "logo",
              "website",
            ],
          },
          {
            model: models.Membership,
            attributes: [
              "membershipNumber",
              "starderdPoints",
              "tiresPoints",
              "memmbershipTier",
            ],
          },
        ],
      });
      if (membershipRelation) {
        let membershipRelationPraser = companyTransformer(
          membershipRelation.dataValues.Company
        );
        delete membershipRelation.dataValues.Company;
        membershipRelation.dataValues.company = membershipRelationPraser;
        membershipRelationPraser = membershipTransformer(
          membershipRelation.dataValues.Membership
        );
        delete membershipRelation.dataValues.Membership;
        membershipRelation.dataValues.membership = membershipRelationPraser;
        return memberRelationTransformer(membershipRelation);
      }
    }
    // if the user type User
    if (requesterType == "user") {
      // The Id should be the member id
      membershipRelation = await models.MemberRelation.findOne({
        where: {
          id,
          [Op.or]: [
            { firstMemberId: requesterId },
            { secondMemberId: requesterId },
          ],
        },
        include: {
          model: models.Company,
          attributes: ["name", "email", "phone", "address", "logo", "website"],
        },
      });
      if (membershipRelation) {
        let membershipRelationPraser = companyTransformer(
          membershipRelation.dataValues.Company
        );
        delete membershipRelation.dataValues.Company;
        membershipRelation.dataValues.company = membershipRelationPraser;
        return memberRelationTransformer(membershipRelation);
      }
    }
    // if the user type Company
    if (requesterType == "company") {
      membershipRelation = await models.MemberRelation.findOne({
        where: { id, companyId: requesterId },
        include: [
          {
            model: models.Membership,
            attributes: [
              "membershipNumber",
              "starderdPoints",
              "tiresPoints",
              "memmbershipTier",
            ],
          },
        ],
      });
      if (membershipRelation) {
        let membershipRelationPraser = membershipTransformer(
          membershipRelation.dataValues.Membership
        );
        delete membershipRelation.dataValues.Membership;
        membershipRelation.dataValues.membership = membershipRelationPraser;
        return memberRelationTransformer(membershipRelation);
      }
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

const deleteRelation = async (id, requesterId) => {
  try {
    const relation = await getInstanceById(id, "MemberRelation");
    const membership = await models.Membership.findOne({where :{ userId: requesterId, companyId : relation.companyId}});
    if (relation) {
      if (membership) {
        if (
          relation.dataValues.firstMemberId == membership.id ||
          relation.dataValues.secondMemberId == membership.id
        ) {
          await relation.destroy();
          return memberRelationTransformer(relation);
        } else
          throw new Error("You have no access to delete this member relation");
      } else throw new Error("No membership found");
    } else throw new Error("A member relation not found");
  } catch (err) {
    throw new Error(err.message);
  }
};
module.exports = {
  addRelation,
  getAllRelations,
  getRelation,
  deleteRelation,
};
