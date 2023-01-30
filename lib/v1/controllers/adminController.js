const {
  failedWithMessage,
  successWithMessage,
} = require("../responser/responses");
const { addAdmin, loginService, updateAdmin, getAdmin, deleteAdmin, getAllAdmins } = require("../services/adminServices");
const { getToken } = require("../tokenManager/token");

const store = async (req, res, next) => {
  try {
    const newAdmin = await addAdmin({ ...req.body });
    if (!newAdmin) {
      return failedWithMessage("This email already exist!", res);
    }
    return successWithMessage("Admin created successfully", res, newAdmin);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
const login = async (req, res, next) => {
  try {
    const admin = await loginService(req.body);
    if (admin) {
      if (admin.email == "superadmin@gmail.com") {
        const token = getToken({
          id: admin.id,
          type: "superadmin",
        });
        return successWithMessage("Logged in successfully", res, {
          admin,
          token: token,
        });
      } else {
        const token = getToken({
          id: admin.id,
          type: "admin",
        });
        return successWithMessage("Logged in successfully", res, {
          admin,
          token: token,
        });
      }
    }
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const update = async (req, res, next) => {
  try {
    const admin = await updateAdmin(req.params.id, {...req.body});
    return successWithMessage("Admin updated successfully", res, admin);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
const show = async (req, res, next) => { 
  try {
    const user = await getAdmin(req.params.id);
    if (user) return successWithMessage("Admin found", res, user);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }

}
const destroy = async (req, res, next) => { 
  try {
    const admin = await deleteAdmin(req.params.id);
    if (admin) return successWithMessage("admin deleted successfully", res);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
}
const index = async (req, res, next) => {
  try {
    const admin = await getAllAdmins();
    return successWithMessage("Admins found", res, admin);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
module.exports = {
  store,
  login,
  update,
  show,
  destroy,
  index
};
