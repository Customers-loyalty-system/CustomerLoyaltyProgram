const models = require("../models");
const { getInstanceById } = require("./modelService");

const addBill = async (id, params) => {
  params.companyId = id
  try {
    const company =await getInstanceById(id, "Company");
    if (company) {
      const [bill, created] = await models.Bill.findOrCreate({
        where: { billReference: params.billReference },
        defaults: {
          ...params,
        },
      });
      if (created) {
        return bill;
      } else {
        throw new Error("Bill already exist!");
      }
    } else return null;
  } catch (err) {
    throw new Error(
      "loyalty application has server error, Please let the custmer call the loyaty application call service to gain his points"
    );
  }
};
const removeBill =  async (billNumber) =>{
  const findBill = await models.Bill.findOne({
    where: {
      billNumber : billNumber
    }
  })
  try{
    if(findBill){
      const removedBill = await findBill.destroy()
      if(removedBill) return removedBill
      else return null
     }
  }catch(err){
    throw new Error(err);
  }

}

module.exports = {
  addBill,
  removeBill
};
