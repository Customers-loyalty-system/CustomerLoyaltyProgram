const {
  adminTransformer,
  adminsTransformer,
} = require("../transformer/adminTransformer");
const { hashPassword, verifyPassword } = require("../utils/passwordUtile");
const models = require("../models");
const { getInstanceById } = require("./modelService");

const addAdmin = async (params) => {
  params.password = hashPassword(params.password);
  try {
    const [admin, created] = await models.Admin.findOrCreate({
      where: { email: params.email },
      defaults: {
        ...params,
      },
    });
    if (created) {
      return adminTransformer(admin);
    }
    return null;
  } catch (err) {
    throw new Error(err.parent.sqlMessage);
  }
};

const loginService = async (params) => {
  const { email, password } = params;
  try {
    var admin = await models.Admin.findOne({
      where: {
        email,
      },
    });
    if (admin) {
      if (verifyPassword(password, admin.password)) {
        return adminTransformer(admin);
      } else {
        throw new Error("Invalid password!");
      }
    }
    throw new Error("There no registerd admin with provided information");
  } catch (err) {
    throw new Error(err);
  }
};
const updateAdmin = async (id, params) => {
  params.password = hashPassword(params.password);
  try {
    const admin = await getInstanceById(id, "Admin");
    if (admin) {
      await admin.update({
        ...params,
      });
      return adminTransformer(admin);
    }
    throw new Error("Admin not found");
  } catch (err) {
    throw new Error(err.parent.sqlMessage);
  }
};

const getAdmin = async (id) => {
  try {
    const admin = await getInstanceById(id, "Admin");
    if (admin) return adminTransformer(admin);
    else throw new Error(admin);
  } catch (err) {
    throw new Error(err);
  }
};

const deleteAdmin = async (id) => {
  const admin = await getInstanceById(id, "Admin");

  try {
    if (admin) {
      const removedAdmin = await admin.destroy();
      if (removedAdmin) return removedAdmin;
    }
  } catch (err) {
    throw new Error(err);
  }
};
const getAllAdmins = async () => {
  try {
    const admins = await models.User.findAll();
    if (admins) return adminsTransformer(admins);
    throw new Error("No admins Found");
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = {
  addAdmin,
  loginService,
  updateAdmin,
  getAdmin,
  deleteAdmin,
  getAllAdmins,
};
