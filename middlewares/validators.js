const { sendResponse } = require("../helpers/utils");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const validators = {};

// validate fields
validators.validate = (validationArray) => async (req, res, next) => {
  // Promise.all to get validation output
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  // errors type: object

  if (errors.isEmpty()) {
    // run the controller in case of no error
    return next();
  }

  const message = errors
    .array()
    .map((err) => err.msg)
    .join(" & ");

  // return sendResponse(res, 422, false, null, "Validation Error", { message });
  return sendResponse(res, 422, false, null, { message }, "Validation Error");
};

// validate id (mongoose ObjectId)
validators.checkObjectId = (paramId) => {
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    throw new Error("Invalid ObjectId");
  }
  return true;
};

module.exports = validators;
