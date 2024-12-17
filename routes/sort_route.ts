import { Router } from "express";
import * as sortController from "../controller/sort_controller";
import { verifyTokenAndInstructor } from "../middleware/auth/auth_middleware";

const router = Router();
router.use(verifyTokenAndInstructor)
router.get("/students",sortController.getSortedStudents);
router.get("/courses",sortController.getSortedCourses);

export default router;
