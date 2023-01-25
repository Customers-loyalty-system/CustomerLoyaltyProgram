const {
  successWithMessage,
  failedWithMessage,
} = require("../responser/responses");
const { addUser, loginService } = require("../services/userService");

const user = {
  name: null,
  surname: null,
  gender: null,
  title: null,
  email: null,
  password: null,
  birthdate: null,
  phone: null,
  avatar: null,
};
const store = async (req, res, next) => {
  const { ...user } = req.body;
  const avatar = req.file.filename;
  user.avatar = avatar;
  try {
    const newUser = await addUser(user);
    if (!newUser) {
      return failedWithMessage("You are already registerd!", res);
    }
    return successWithMessage("User created successfully", res, newUser);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const login = async (req, res, next) => {
  const user = await loginService(req.body);
  try {
    if (user) return successWithMessage("Logged in successfully", res, ...user);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
module.exports = {
  store,
  login,
};
