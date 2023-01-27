const { Op } = require("sequelize");
const models = require("../models");
const {
  userTransformer,
  usersTransformer,
} = require("../transformer/userTransformer");
const { hashPassword, verifyPassword } = require("../utils/passwordUtile");
const { getInstanceById } = require("./modelService");

const addUser = async (params) => {
  params.birthdate = Date.parse(params.birthdate);
  params.password = hashPassword(params.password);
  try {
    const [user, created] = await models.User.findOrCreate({
      where: { [Op.or]: [{ phone: params.phone }, { email: params.email }] },
      defaults: {
        ...params,
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
        return  userTransformer(user)
      } else {
        throw new Error("Invalid password!");
      }
    }
    throw new Error("There no registerd user with provided information");
  } catch (err) {
    throw new Error(err);
  }
};
const getUser = async (id) => {
  try {
    const user = await getInstanceById(id, "User");
    if (user) return userTransformer(user);
    else throw new Error(user);
  } catch (err) {
    throw new Error(err);
  }
};

const updateUser = async (id, params) => {
  params.birthdate = Date.parse(params.birthdate);
  params.password = hashPassword(params.password);
  try {
    const user = await getInstanceById(id, "User");
    if (user) {
      await user.update({
        ...params,
      });
      if (user?.dataValues?.birthdate) {
        user.dataValues.birthdate = user?.dataValues?.birthdate
          .toJSON()
          .slice(0, 10);
      }
      return userTransformer(user);
    }
    throw new Error("User not found");
  } catch (err) {
    throw new Error(err.parent.sqlMessage);
  }
};

const deleteUser = async (id) => {
  const user = await getInstanceById(id, "User");

  try {
    if (user) {
      const removedUser = await user.destroy();
      if (removedUser) return removedUser;
      return null
    }
  } catch (err) {
    throw new Error(err);
  }
};

const getAllUsers = async () => { 
  try { 
    const users = await models.User.findAll()
    if (users) return usersTransformer(users)
    throw new Error('No users Found')
  }
  catch(err) { 
    throw new Error(err)
  }
}
module.exports = {
  addUser,
  loginService,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers
};
