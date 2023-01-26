const {
  failedWithMessage,
  successWithMessage,
} = require("../responser/responses");
const { addCompany, loginService, getCompany, updateCompany, deleteCompany, getAllCompanies } = require("../services/companyServices");
const { getToken } = require("../tokenManager/token");

const store = async (req, res, next) => {
  try {
    const company = await addCompany({ ...req.body, logo: req.file.filename });
    if (!company) {
      return failedWithMessage("This email already exist", res);
    }
    return successWithMessage("Company created successfully", res, company);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const login = async (req, res, next) => {
  try {
    const company = await loginService(req.body);
    if (company) {
      const token = getToken({
        id: company.id,
        type: "company",
      });
      return successWithMessage("Logged in successfully", res, {
        company,
        token: token,
      });
    }
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const show = async (req, res, next) => {
  try {
    const company = await getCompany(req.params.id);
    if (company) return successWithMessage("Company found", res, company);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
const update = async (req, res, next) => { 
  try {
    const company = await updateCompany(req.params.id, {
      ...req.body,
      logo: req.file.filename,
    });
    return successWithMessage("Company updated successfully", res, company);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
}

const destroy = async (req, res, next) => { 
  try {
    const company = await deleteCompany(req.params.id);
    if(company) return successWithMessage("Company deleted successfully", res);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
}
const index = async ( req, res, next) => { 
  try {
    const companies = await getAllCompanies();
    if (companies) return successWithMessage("Companies found", res, companies);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
}
module.exports = {
  store,
  login,
  show,
  update,
  destroy,
  index
};
