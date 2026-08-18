import { Router } from 'express';
import * as c from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Create application (applicants only)
router.post('/', authorize('applicant'), c.createApplication);

// Get applicant's applications (applicants only)
router.get('/my-applications', authorize('applicant'), c.myApplications);

// Check if applicant has already applied for a job (applicants only)
router.get('/check/:jobId', authorize('applicant'), c.checkApplicationStatus);

// Get specific application
router.get('/:id', c.getApplication);

export default router;
