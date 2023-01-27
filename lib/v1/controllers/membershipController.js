const {
  failedWithMessage,
  createdWithMessage,
} = require("../responser/responses");
const { addMember, getMembers } = require("../services/membershipServices");

const store = async (req, res, next) => {
  try {
    const membership = await addMember(req.body.phone, req.tokenHolder.id);
    if (membership)
      return createdWithMessage(
        "A new membershio created successfully!",
        res,
        membership.membershipNumber
      );
    else
      return failedWithMessage(
        "This phone number has a membershio in your compnay",
        res
      );
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const index = async (req, res, next) => {
  console.log('index')
  try {
    const members = await getMembers(req.params.id);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
module.exports = {
  store,
  index,
};
