const User = require("../users.schema.js");
const { StatusCodes } = require("http-status-codes");
const logger = require("../../helpers/winston.helper.js");
const errorLogger = require("../../helpers/errorLogger.helper.js");

// Single provider handling both approve and reject.
// Action is determined by req.body.action — "approved" | "rejected"
// Route: PATCH /items/:id/verify

async function blockUserProvider(req, res) {
  try {
  
    if (req.user?.role?.toLowerCase() !== "admin") {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Admin access required",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    logger.info("User block status updated", {
      adminId: req.user.sub,
      targetUserId: user._id,
      isBlocked: user.isBlocked,
    });

    return res.status(StatusCodes.OK).json({
      message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
      data: user,
    });

  } catch (error) {
    console.log(error);
    errorLogger("Error verifying item", req, error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to verify item",
    });
  }
}

module.exports = blockUserProvider;