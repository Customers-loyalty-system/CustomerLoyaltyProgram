const companyTransformer = (company) => {
    delete company.dataValues.deletedAt;
  
    if (company?.dataValues?.password) {
      delete company.dataValues.password;
    }
    if (company?.logo) {
      company.logo = process.env.serverUrl + "/uploads/" + company.logo;
    }
  
    return company;
  };
  
  const companiesTransformer = (companies) => {
    return companies.map((company) => companyTransformer(company));
  };
  module.exports = {
    companyTransformer,
    companiesTransformer,
  };
  