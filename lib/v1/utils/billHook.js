const request = require("request");
var rp = require("request-promise");
const { json } = require("sequelize");

var options = {
  method: "POST",
  uri: "http://localhost:3000/api/v1/companies/login",
  body: JSON.stringify({
    email: "loyalty@loyalty.com",
    password: "Ab123456!",
  }),
  headers: {
    "content-type": "application/json",
  },
};
var res
const BillHook = async (billNumber, billReference, companyName) => {
  rp(options)
    .then((body) => {
      request(
        {
          method: "POST",
          uri: "http://localhost:3000/api/v1/bills/findbill",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${JSON.parse(body).token}`,
          },
          body: JSON.stringify({
            billNumber,
            billReference,
            companyName,
          }),
        },
        async (error, response, body) => {
          if ( await body) {
            res = await JSON.parse(body)
          } else return error;
        }
      );
    })
    .catch((err) => {
      console.log(err);
    });
    return res
};

module.exports = {
  BillHook,
};
