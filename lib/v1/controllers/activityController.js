const {
  failedWithMessage,
  successWithMessage,
} = require("../responser/responses");
const { getAllActivities,getActivity } = require("../services/activityServices");

const index = async (req, res, next) => {
  try {
    const activities = await getAllActivities(
      req.tokenHolder.id,
      req.tokenHolder.type,
      +req.query.page
    );
    return successWithMessage("All activities that found", res, activities);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};

const show = async (req, res, next) => {
  try {
    const activity = await getActivity(
      req.params.id,
      req.tokenHolder.id,
      req.tokenHolder.type
    );
    return successWithMessage("The activity that found", res, activity);
  } catch (err) {
    return failedWithMessage(err.message, res);
  }
};
module.exports = {
  index,
  show,
};
