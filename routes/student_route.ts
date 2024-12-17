import { Router } from "express";
import * as StudentController from "../controller/student_controller";
import {studentValidator} from "../middleware/validators/student.validator"
import { verifyToken, verifyTokenAndInstructor } from "../middleware/auth/auth_middleware";

const router = Router();
router.use(verifyToken)


router.put("/:id", studentValidator, StudentController.updateStudent);
router.get("/:id", StudentController.getStudentById);
router.use(verifyTokenAndInstructor)
router.post("/", studentValidator, StudentController.createStudent);
router.get("/", StudentController.getStudents);
router.delete("/:id",StudentController.deleteStudent)


export default router;
