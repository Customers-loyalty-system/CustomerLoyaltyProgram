const {
  companyTransformer,
  companiesTransformer,
} = require("../transformer/companyTransformer");
const { hashPassword, verifyPassword } = require("../utils/passwordUtile");
const models = require("../models");
const { getInstanceById } = require("./modelService");
const {
  membershipsTransformer,
} = require("../transformer/membershipTransformer");
const { userTransformer } = require("../transformer/userTransformer");

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
      return companyTransformer(company);
    }
    return null;
  } catch (err) {
    throw new Error(err.parent.sqlMessage);
  }
};

const loginService = async (params) => {
  const { email, password } = params;
  try {
    console.log("test");
    var company = await models.Company.findOne({
      where: {
        email,
      },
    });
    console.log(company);
    if (company) {
      if (verifyPassword(password, company.password)) {
        return companyTransformer(company);
      } else {
        throw new Error("Invalid password!");
      }
    }
    throw new Error("There no registerd company with provided information");
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
module.exports = {
  addCompany,
  loginService,
  getCompany,
  updateCompany,
  deleteCompany,
  getAllCompanies,
  getCompanyMembersService,
};
