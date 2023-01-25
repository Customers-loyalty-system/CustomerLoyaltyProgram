const { token } = require("morgan");
const { Op, Error } = require("sequelize");
const models = require("../models");
const { getToken } = require("../tokenManager/token");
const {
  userTransformer,
  usersTransformer,
} = require("../transformer/userTransformer");
const { hashPassword, verifyPassword } = require("../utils/passwordUtile");

const addUser = async (newUser) => {
  newUser.birthdate = Date.parse(newUser.birthdate);
  newUser.password = hashPassword(newUser.password);

  try {
    const [user, created] = await models.User.findOrCreate({
      where: { [Op.or]: [{ phone: newUser.phone }, { email: newUser.email }] },
      defaults: {
        ...newUser,
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

const loginService = async (params) => {
  const { phone, password } = params;
  try {
    var user = await models.User.findOne({
      where: {
        phone,
      },
    });
    if (user) {
      if (verifyPassword(password, user.password)) {
        const token = getToken({
          id: user.id,
          type: "user",
        });
        return [{ user: userTransformer(user), token: token }];
      } else {
        throw new Error("Invalid password!");
      }
    }
    throw new Error("There no registerd user with provided information");
  } catch (err) {
    throw new Error(err);
  }
};
module.exports = {
  addUser,
  loginService,
};
