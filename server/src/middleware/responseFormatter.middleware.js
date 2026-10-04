const { StatusCodes, getReasonPhrase } = require("http-status-codes");

function responseFormatter(req, res, next) {
  const originalJson = res.json;

  res.json = (data) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : StatusCodes.OK;

    const response = {
      status:     statusCode >= 200 && statusCode < 300 ? "success" : "error",
      statusCode: statusCode,
      message:    getReasonPhrase(res.statusCode),
    };

    // Guard: data can be null on certain error paths (e.g. DB errors returning null)
    const safeData = data ?? {};

    if (safeData.message) {
      response.message = safeData.message;
    }

    if (statusCode >= 200 && statusCode < 300) {
      // If safeData has a data key (e.g. { message: "...", data: result }), unwrap it directly
      if (safeData.data !== undefined) {
        response.data = safeData.data;
      } else {
        response.data = safeData;
      }
    }

    if (statusCode >= 300) {
      response.error = safeData;
      if (safeData.reason) {
        response.message = safeData.reason;
      }
    }

    if (safeData.pagination) {
      response.pagination = safeData.pagination;
    }

    if (safeData.summary) {
      response.summary = safeData.summary;
    }

    originalJson.call(res, response);
  };

  next();
}

module.exports = responseFormatter;