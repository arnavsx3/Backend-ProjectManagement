import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  uploadUserAvatar,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controllers/auth.controllers.js";
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgotPasswordValidator,
} from "../validators/index-validators.js";
import { validate } from "../middlewares/validator-middleware.js";
import { login } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth-middleware.js";
import { upload } from "../middlewares/multer-middleware.js";
const authRouter = Router();

// unsecured routes
authRouter.route("/register").post(userRegisterValidator(), validate, registerUser);
authRouter.route("/login").post(userLoginValidator(), validate, login);
authRouter.route("/verify-email/:verificationToken").get(verifyEmail);
authRouter.route("/refresh-token").post(refreshAccessToken);
authRouter
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
authRouter
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

// secured routes
authRouter.route("/logout").post(verifyJWT, logoutUser);
authRouter.route("/current-user").get(verifyJWT, getCurrentUser);
authRouter
  .route("/change-password")
  .post(
    verifyJWT,
    userChangeCurrentPasswordValidator(),
    validate,
    changeCurrentPassword,
  );
authRouter
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);
authRouter
  .route("/upload-avatar")
  .put(verifyJWT, upload.single("avatar"), uploadUserAvatar);
export {authRouter};
