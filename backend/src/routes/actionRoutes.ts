import { 
    sendStudentCatMessage, 
    sendTeacherCatMessage, 
    teacherCatDone, 
    uploadProblem 
} from '../controllers/actionController';
import { Router } from 'express';

const router = Router();

router.post('/actions/upload-problem', uploadProblem); // Send a problem, receive first question from teacher cat
router.post('/actions/teacher-cat-message', sendTeacherCatMessage); // Send teacher cat a message, receive one back
router.post('/actions/teacher-cat-done', teacherCatDone); // Boolean for done or not, handled accordingly
router.post('/actions/student-cat-message', sendStudentCatMessage); // Send student cat a message, receive one back
                                               // If done, include flag and points earned

export default router;