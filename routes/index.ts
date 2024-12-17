import { Router } from "express";
import * as authController from "../controller/auth_controller"

const router =Router();

router.post("/login",authController.Login);
router.post("/password-reset",authController.ResetPassword);
router.post("/request-reset",authController.RequestPasswordReset);

export default router;