import { Router} from "express";
import * as EnrollmentController from "../controller/enrollment_controller";
import { verifyToken, verifyTokenAndInstructor } from "../middleware/auth/auth_middleware";

const router = Router();

router.use(verifyToken)
router.get("/student/:studentId",EnrollmentController.getEnrollmentsForStudent);
router.get("/course/:courseCode",verifyTokenAndInstructor, EnrollmentController.getEnrollmentsForCourse);
router.post("/", EnrollmentController.enrollStudent);
router.delete("/:enrollmentId",EnrollmentController.cancelEnrollment);

export default router;
