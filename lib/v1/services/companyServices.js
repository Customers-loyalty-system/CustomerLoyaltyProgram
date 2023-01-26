const { companyTransformer, companiesTransformer } = require("../transformer/companyTransformer");
const { hashPassword, verifyPassword } = require("../utils/passwordUtile");
const models = require("../models");
const { getInstanceById } = require("./modelService");
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
    var company = await models.Company.findOne({
      where: {
        email,
      },
    });
    console.log("from try -->", company);
    if (company) {
      if (verifyPassword(password, company.password)) {
        return companyTransformer(company);
      } else {
        throw new Error("Invalid password!");
      }
    }
    throw new Error("There no registerd company with provided information");
  } catch (err) {
    console.log("form err -->", err);
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
    const companies = await models.Company.findAll()
    if (companies) return companiesTransformer(companies)
    throw new Error('No companies Found')
  }
  catch(err) { 
    throw new Error(err)
  }
}
module.exports = {
  addCompany,
  loginService,
  getCompany,
  updateCompany,
  deleteCompany,
  getAllCompanies
};