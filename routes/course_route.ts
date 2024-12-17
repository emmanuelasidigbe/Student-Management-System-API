import { Router } from "express";
import * as CourseController from "../controller/course_controller";
import {courseValidator} from "../middleware/validators/course.validator";
import { verifyToken, verifyTokenAndInstructor } from "../middleware/auth/auth_middleware";
const router = Router();

router.use(verifyToken)
router.get("/", CourseController.getCourses);
router.get("/:courseCode", CourseController.getCourseByCode);
router.use(verifyTokenAndInstructor)
router.post("/", courseValidator, CourseController.createCourse);
router.put("/:courseCode",courseValidator,CourseController.updateCourse);
router.delete("/:courseCode",CourseController.deleteCourse);


export default router;
