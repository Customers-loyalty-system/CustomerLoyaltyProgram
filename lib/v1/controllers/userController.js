const {
  successWithMessage,
  failedWithMessage,
} = require("../responser/responses");
const {
  addUser,
  loginService,
  getUser,
  updateUser,
  deleteUser,
} = require("../services/userService");

// const user = {
//   name: null,
//   surname: null,
//   gender: null,
//   title: null,
//   email: null,
//   password: null,
//   birthdate: null,
//   phone: null,
//   avatar: null,
// };
const store = async (req, res, next) => {
  // const { ...user } = req.body;
  // const avatar = req.file.filename;
  // user.avatar = avatar;
  try {
    const newUser = await addUser({ ...req.body, avatar: req.file.filename });
    if (!newUser) {
      return failedWithMessage("You are already registerd!", res);
    }
    return successWithMessage("User created successfully", res, newUser);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await loginService(req.body);
    if (user) return successWithMessage("Logged in successfully", res, ...user);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const show = async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    if (user) return successWithMessage("User found", res, user);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, {
      ...req.body,
      avatar: req.file.filename,
    });
    return successWithMessage("User updated successfully", res, user);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const destroy = async (req, res, next) => {
  try {
    const user = await deleteUser(req.params.id);
    if (user) return successWithMessage("User deleted successfully", res);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
module.exports = {
  store,
  login,
  show,
  update,
  destroy
};
