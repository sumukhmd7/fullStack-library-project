const userValidationSchema = require("./userValSchema");

module.exports = {
  // Validator for signup
  signupUserValidation: (req, res, next) => {
    const result = userValidationSchema.signupUser.safeParse(req.body);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    next();
  },

  // Validator for user login
  userLoginValidation: (req, res, next) => {
    const result = userValidationSchema.userLogin.safeParse(req.body);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    next();
  },

  // Validator for reset password
  resetPasswordValidation: (req, res, next) => {
    const result = userValidationSchema.resetPassword.safeParse(req.body);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    next();
  },

  // Validator for set new password
  setNewPasswordValidation: (req, res, next) => {
    const result = userValidationSchema.setNewPassword.safeParse(req.body);

    if (!result.success) {
      return res.status(403).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    next();
  },
};
